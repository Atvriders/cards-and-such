import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2460 — the LobbyPage `chip-top-rated` Chip <button> MUST NOT carry an
 * `id` attribute. The Chip helper (LobbyPage.tsx ~L2651-2666) emits exactly
 * the following props on its <button> wrapper:
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
 * Notably absent — and load-bearing in its absence — is any `id` on the
 * top-rated chip itself. Adding one would silently:
 *   1. Create a stable URL fragment target (`/#chip-top-rated`) that
 *      external links and bookmarks could come to depend on, making it an
 *      undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from sibling components
 *      (e.g. the drawer tablist or the grid heading) to point at the
 *      chip, coupling those surfaces to an attribute this codebase has
 *      deliberately not advertised.
 *   3. Risk an id collision: the lobby DOM is large and the drawer
 *      surface uses `lobby-drawer-cat-*` ids on the parallel filter
 *      tablist — duplicate or overlapping ids would silently break
 *      `getElementById` lookups and URL fragment scrolling.
 *
 * Sibling pins on `chip-top-rated` already in the suite cover OTHER
 * attributes but NOT the `id` absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-top-rated.
 *   - W1139 / LobbyTopRatedChipBadgeZero pins the count-badge text
 *     content as "0" when `cards-ratings` is empty.
 *   - W1481 / LobbyChipTopRatedGlyphAria pins the "★" glyph and its
 *     `aria-hidden="true"` attribute.
 *   - W718 / LobbyPage.test.tsx pins the persistence round-trip via
 *     `aria-pressed` on chip-top-rated.
 *   - LobbyTopRatedFilter pins `aria-pressed` toggling on click.
 *
 * The closest analogues are W2450 / LobbyChipFavoritesNoId and W2429 /
 * LobbyChipDiceNoId, which pin the same `id`-absence contract on
 * chip-favorites (static branch) and chip-dice (dynamic
 * `CATEGORY_ORDER.map` branch). chip-top-rated is rendered through the
 * *static* JSX branch at LobbyPage.tsx ~L1936-1942 — distinct from the
 * dynamic per-category branch and from chip-all (which is the very first
 * static chip). A regression that added `id={testId}` (a tempting symmetry
 * with `data-testid={testId}`) only to the top-rated chip while leaving
 * its siblings alone would slip through W2429/W2450/W2429-class pins.
 * This file closes that gap on chip-top-rated specifically.
 *
 * Resolves the chip via its stable `data-testid="chip-top-rated"`
 * (rendered through `testId="chip-top-rated"` at LobbyPage.tsx ~L1940)
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-top-rated button has no id attribute (W2460)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-top-rated <button> does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-top-rated");

    // Sanity: confirm we pinned the actual chip-top-rated <button>
    // wrapper and not a child span. The Chip helper emits a <button>
    // for keyboard accessibility, and going through
    // `data-testid="chip-top-rated"` would resolve a child element if
    // any future refactor moved the testid down onto an inner span —
    // which would itself be a regression.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `id` attribute on chip-top-rated. Use
    // `hasAttribute` rather than checking for an empty string — an
    // `id=""` would still be a (broken) public surface that future code
    // could come to depend on, and `getAttribute("id")` returning ""
    // would silently pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("id")).toBe(false);
  });
});
