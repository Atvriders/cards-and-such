import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1258 — every category chip in the lobby tablist is rendered with
 * an explicit `type="button"` attribute on its underlying `<button>`.
 *
 * Why this matters:
 *  - A `<button>` inside a `<form>` defaults to `type="submit"`. The
 *    chip strip is not currently nested in a form, but the lobby DOM
 *    is large and a future refactor (e.g. wrapping the search +
 *    chip-strip in a single `<form>` for native Enter-submit behaviour)
 *    would silently turn every chip into a submit button, swallow
 *    Enter-key activations and trigger spurious form submissions.
 *  - The `<Chip>` component (LobbyPage.tsx ~L2651) sets `type="button"`
 *    once and every chip-* button — chip-all, chip-cards, chip-board,
 *    etc. — flows through it, so a single-line regression deleting the
 *    attribute breaks the contract for the entire tablist.
 *
 * Existing coverage in this directory pins related chip attributes —
 * `aria-pressed` (LobbyPage.test.tsx W608/W2415), `aria-selected` /
 * tablist wiring (LobbyChipStripAria.test.tsx), and the chip badge
 * counts (LobbyAllChipBadge.test.tsx, LobbyFavoritesChipBadgeZero.test.tsx,
 * etc.) — but none assert the `type` attribute on a chip button itself.
 * A refactor that drops `type="button"` from the `<Chip>` JSX would
 * therefore slip through every existing test.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W912/W901/W874 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the main spec file.
 */
describe("LobbyPage — chip button type attribute (W1258)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-all with an explicit type=\"button\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns null when the
    // attribute is omitted, so a regression that drops the prop
    // (and lets the button default to "submit") fails here.
    expect(chip.getAttribute("type")).toBe("button");

    // DOM-reflected property as a belt-and-braces guard: the IDL
    // attribute normalises to "submit" when the markup attribute is
    // missing, so this catches the same regression from a second
    // angle and ensures we are not just reading a stale attribute
    // node that React happened to leave on the element.
    expect(chip.type).toBe("button");
  });
});
