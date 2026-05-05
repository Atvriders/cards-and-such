import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2464 — the `chip-recently-played` chip in the lobby tablist must
 * render its underlying `<button>` element with an explicit
 * `type="button"` attribute.
 *
 * Why this matters specifically for chip-recently-played:
 *  - LobbyChipType.test.tsx (W1258) pins the `type="button"` contract
 *    only for `chip-all`. The other status chips (top-rated, favorites,
 *    recently-played, hidden) and per-category chips have no
 *    per-testid `type` assertion of their own.
 *  - A `<button>` defaults to `type="submit"` when nested inside a
 *    `<form>`. While the lobby chip strip is not currently form-wrapped,
 *    a future refactor that introduces a form (e.g. native Enter-submit
 *    on the search row) would silently flip each chip to a submit
 *    button, breaking the recently-played filter toggle.
 *  - Existing chip-recently-played coverage pins `aria-pressed` toggling
 *    (LobbyPage.test.tsx ~L2182), the glyph contract (W1462,
 *    LobbyChipRecentGlyphAria), the zero-state badge (W1175,
 *    LobbyRecentlyPlayedChipBadgeZero), the tagName BUTTON (W1962,
 *    LobbyChipTag), and the recently-played intrinsic ordering
 *    (LobbyRecentlyPlayedOrder) — but none of these touch the raw
 *    `type` attribute on this specific chip.
 *
 * A regression that drops `type="button"` from the shared `<Chip>` JSX
 * (LobbyPage.tsx ~L2651) would therefore still pass W1258 only if the
 * change accidentally preserved the attribute on chip-all but not on
 * chip-recently-played — so this test pins the contract independently
 * for the recently-played chip.
 */
describe("LobbyPage — chip-recently-played button type attribute (W2464)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders chip-recently-played with an explicit type=\"button\" attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-recently-played") as HTMLButtonElement;

    // Raw attribute check — `getAttribute` returns null when the
    // attribute is omitted, so a regression that drops the prop
    // (and lets the button default to "submit" inside a future form)
    // fails here.
    expect(chip.getAttribute("type")).toBe("button");

    // DOM-reflected property as a belt-and-braces guard: the IDL
    // attribute normalises to "submit" when the markup attribute is
    // missing, so this catches the same regression from a second
    // angle and ensures we are not just reading a stale attribute
    // node that React happened to leave on the element.
    expect(chip.type).toBe("button");
  });
});
