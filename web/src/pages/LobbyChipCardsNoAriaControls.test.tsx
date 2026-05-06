import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2576 — the `chip-cards` button (the per-category chip emitted by the
 * `Chip` helper at LobbyPage.tsx ~L2651-2666) MUST NOT carry an
 * `aria-controls` attribute. The production JSX threads only `type`,
 * `role="tab"`, `aria-selected`, `aria-pressed`, `className`, `onClick`,
 * and `data-testid` through the underlying `<button>`. There is no
 * tabpanel wired to these chips today — clicking a chip filters the
 * grid in-place rather than swapping a tabpanel — so an `aria-controls`
 * pointer would dangle and screen readers would announce a panel
 * relationship that does not exist.
 *
 * Sibling coverage on the chip-strip already pins many positive and a
 * few negative attributes:
 *   - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"`.
 *   - W1424 (LobbyChipCardsBadge.test.tsx) pins the badge count text.
 *   - W1495 (LobbyChipCardsGlyphAria.test.tsx) pins glyph aria-hidden.
 *   - LobbyChipCardsRole / LobbyChipCardsType pin role + type.
 *   - LobbyChipCardsAriaPressedDefault / LobbyChipCardsAriaSelectedDefault
 *     pin the default false-state of those two ARIA props.
 *   - LobbyChipCardsNoId (W2469) pins id-absence.
 *   - LobbyChipCardsNoStyle pins inline-style absence.
 *
 * What none of those pin: the `aria-controls` attribute. Because the
 * chip carries `role="tab"`, a future refactor that introduces a real
 * tablist/tabpanel pattern would naturally reach for `aria-controls`.
 * That refactor is non-trivial and would need its own design (panel id
 * scheme, focus management, keyboard nav) — silently adding
 * `aria-controls={…}` without the rest of the wiring would yield a
 * broken-pointer accessibility regression that no current test would
 * catch. Pinning attribute-absence here forces any such refactor to be
 * accompanied by a deliberate update to the contract.
 *
 * Per the W2576 dispatch directive: pin one untested attribute on the
 * `data-testid="chip-cards"` element. `aria-controls`-absence is the
 * canonical "negative" pin that complements the existing
 * `role="tab"` positive pin and locks down the contract that these
 * chips behave as filter buttons, not as tabpanel controllers.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * follows the W1424 / W1495 / W2469 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-cards has no aria-controls attribute (W2576)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-cards button without an `aria-controls` attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards");

    // The Chip helper (LobbyPage.tsx ~L2651-2666) does NOT thread an
    // `aria-controls` onto the underlying button. `hasAttribute` returns
    // false for an omitted attribute — a regression that adds
    // `aria-controls={…}` to the JSX (or copy-pastes a static value)
    // flips this to true and fails the assertion.
    expect(chip.hasAttribute("aria-controls")).toBe(false);

    // Belt-and-braces: the IDL property `ariaControls` reflects the
    // attribute and normalises to null when absent. Reading it from a
    // second angle catches a regression that sets the attribute via a
    // ref or via setAttribute on mount (which would NOT show up in the
    // initial JSX but WOULD reflect on the DOM).
    expect(chip.getAttribute("aria-controls")).toBeNull();
  });
});
