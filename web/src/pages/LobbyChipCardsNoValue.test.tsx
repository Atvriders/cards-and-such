import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2693 — the `chip-cards` button (per-category chip emitted by the
 * `Chip` helper at LobbyPage.tsx ~L2651-2666) MUST NOT carry a `value`
 * attribute. The production JSX threads only `type`, `role`,
 * `aria-selected`, `aria-pressed`, `className`, `onClick`, and
 * `data-testid` through the underlying `<button>`. A `value` attribute
 * on a `<button>` element is form-submission payload (see HTML spec
 * §form-submission for `<button type="submit">`/`<button type="reset">`):
 * even on a `type="button"` it would still serialise into the form data
 * if the button were ever moved inside a `<form>`, and it would also
 * surface on `HTMLButtonElement.value` as a developer-visible string.
 *
 * The chip strip is purely a client-side filter UI — the click handler
 * (`setFilter(cat)`) is the sole intent surface, and the per-category
 * identity is communicated via `data-testid={`chip-${cat}`}` and the
 * visible label text only. A regression that copy-pasted `value={cat}`
 * onto the chip JSX (or that retrofitted form-submission semantics by
 * wrapping the chip strip in a `<form>` and threading `value=` onto
 * each chip) would break the contract that the chip is a stateless
 * filter trigger, not a form control.
 *
 * Sibling coverage on the chip-cards button:
 *   - W1962 (LobbyChipTag.test.tsx) pins `tagName === "BUTTON"`.
 *   - W1424 (LobbyChipCardsBadge.test.tsx) pins the badge count text.
 *   - W1495 (LobbyChipCardsGlyphAria.test.tsx) pins the glyph aria.
 *   - W2469 (LobbyChipCardsNoId.test.tsx) pins `id`-absence.
 *   - LobbyChipCardsNo{AriaControls,AriaDisabled,AriaLabel,Autofocus,
 *     Form,Name,Style} pin absence of the corresponding attributes.
 *   - LobbyChipCardsType.test.tsx pins `type="button"`.
 *   - None of the above read `value` — a regression that adds
 *     `value={cat}` (or any literal) to the Chip JSX would slip past
 *     every existing chip-cards pin.
 *
 * Per the W2693 dispatch directive: pin one untested attribute on the
 * `data-testid="chip-cards"` element. `value`-absence is the canonical
 * negative pin for a non-form button — it locks down the contract that
 * this button has no form-submission payload.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * follows the W1424 / W1495 / W1962 / W2469 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-cards has no value attribute (W2693)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chip-cards button without a `value` attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-cards");

    // The Chip helper (LobbyPage.tsx ~L2651-2666) does NOT thread a
    // `value` onto the underlying button. `hasAttribute` returns false
    // for an omitted attribute — a regression that adds `value={…}` to
    // the JSX (or copy-pastes a static value) flips this to true and
    // fails the assertion.
    expect(chip.hasAttribute("value")).toBe(false);
  });
});
