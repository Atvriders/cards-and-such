import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2577 — the LobbyPage `chip-favorites` Chip <button> MUST NOT carry an
 * `aria-controls` attribute. The Chip helper (LobbyPage.tsx ~L2651-2666)
 * emits exactly the following props on its <button> wrapper:
 *
 *     <button
 *       type="button"
 *       role="tab"
 *       aria-selected={active}
 *       aria-pressed={active}
 *       className={`lobby-chip${active ? " is-active" : ""}`}
 *       onClick={onClick}
 *       data-testid={testId}
 *     >…</button>
 *
 * Notably absent — and load-bearing in its absence — is any
 * `aria-controls` linkage. The favorites filter does not target a
 * disjoint `id`-addressed region: clicking the chip mutates an internal
 * `category` state that re-renders the SAME `<section class="lobby-grid">`
 * surface in place. There is no panel `id` for `aria-controls` to point
 * at — and W2453 / LobbyChipFavoritesNoId pins the chip's own `id`
 * absence, while W2387 / W2429 / W2450 etc. pin sibling chips' id
 * absence. Adding `aria-controls="lobby-grid"` (or any value) here would
 * either:
 *   1. Dangle — promising AT a target `id` that does not exist in the
 *      DOM, breaking the WAI-ARIA contract for `aria-controls`
 *      (which REQUIRES a matching IDREF), or
 *   2. Force a sibling element to grow an `id` purely to satisfy this
 *      attribute, undoing the deliberate id-absence pins on the grid
 *      (W2401 / LobbyGridNoId) and other surfaces.
 *
 * Sibling pins on `chip-favorites` already cover OTHER attributes but
 * NOT `aria-controls` absence:
 *   - W1962 / LobbyChipTag           — tagName === "BUTTON"
 *   - W1158 / LobbyFavoritesChipBadgeZero — count badge "0" on fresh mount
 *   - W1470 / LobbyChipFavoritesGlyphAria — "♥" glyph + aria-hidden
 *   - W2450 / LobbyChipFavoritesNoId — no id attribute
 *   - W?    / LobbyChipFavoritesNoStyle — no inline style
 *   - W?    / LobbyChipFavoritesType   — type="button"
 *   - W?    / LobbyChipFavoritesRole   — role="tab"
 *   - LobbyPage.test.tsx              — aria-pressed default + after click
 *
 * The closest analogue is W2431 / LobbyDrawerToggleNoAriaControls, which
 * pins the same absence on the desktop drawer toggle button. This file
 * extends that contract to chip-favorites — a different code path
 * (rendered through the static JSX branch at LobbyPage.tsx ~L1943-1949
 * via the `Chip` helper, NOT the `CATEGORY_ORDER.map` dynamic branch).
 *
 * Resolves the chip via its stable `data-testid="chip-favorites"`
 * (rendered through `testId="chip-favorites"` at LobbyPage.tsx ~L1947)
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-favorites button has no aria-controls attribute (W2577)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-favorites <button> does NOT carry an aria-controls attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-favorites");

    // Sanity: confirm we pinned the actual chip-favorites <button>
    // wrapper and not a child span. The Chip helper emits a <button>
    // for keyboard accessibility; if a future refactor moved the testid
    // down onto an inner span, going through `data-testid` would resolve
    // a child element — itself a regression covered by W1962.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `aria-controls` on chip-favorites. Use
    // `hasAttribute` rather than checking for an empty string — an
    // `aria-controls=""` would still violate the WAI-ARIA IDREF contract
    // and `getAttribute("aria-controls")` returning "" would silently
    // pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("aria-controls")).toBe(false);
  });
});
