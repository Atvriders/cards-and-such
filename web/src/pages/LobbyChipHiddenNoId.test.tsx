import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2466 — the LobbyPage `chip-hidden` Chip <button> MUST NOT carry an
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
 * hidden-filter chip itself. Adding one would silently:
 *   1. Create a stable URL fragment target (`/#chip-hidden`) that
 *      external links and bookmarks could come to depend on, making it
 *      an undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from sibling
 *      components (e.g. the drawer tablist or the grid heading) to
 *      point at the chip, coupling those surfaces to an attribute this
 *      codebase has deliberately not advertised.
 *   3. Risk an id collision: the lobby DOM is large and the drawer
 *      surface uses `lobby-drawer-cat-*` ids on the parallel filter
 *      tablist — duplicate or overlapping ids would silently break
 *      `getElementById` lookups and URL fragment scrolling.
 *
 * Sibling pins on `chip-hidden` already in the suite cover OTHER
 * attributes but NOT the `id` absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-hidden.
 *   - W1194 / LobbyHiddenChipBadgeZero pins the count-badge text
 *     content as "0" on a fresh mount with no hidden games.
 *   - W1458 / LobbyChipHiddenGlyphAria pins the "◌" glyph and its
 *     `aria-hidden="true"` attribute on the inner glyph span.
 *   - LobbyPageHide.test.tsx (W697) pins the count badge flipping to
 *     "1" after a hide-tile menu click.
 *
 * The closest analogues are W2450 / LobbyChipFavoritesNoId and
 * W2429 / LobbyChipDiceNoId, which pin the same `id`-absence contract
 * on chip-favorites (rendered through the static JSX branch at
 * LobbyPage.tsx ~L1943-1949) and chip-dice (rendered through the
 * `CATEGORY_ORDER.map` dynamic branch). chip-hidden is rendered through
 * the *static* JSX branch at LobbyPage.tsx ~L1957-1963 — same branch
 * as chip-favorites but with its own JSX node. A regression that added
 * `id={testId}` (a tempting symmetry with `data-testid={testId}`) only
 * to the chip-hidden node while leaving the favorites/dice nodes alone
 * would slip through W2450 and W2429. This file closes that gap on
 * chip-hidden specifically.
 *
 * Resolves the chip via its stable `data-testid="chip-hidden"`
 * (rendered through `testId="chip-hidden"` at LobbyPage.tsx ~L1961)
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W2450 / W2429 / W1458 / W1194 sibling pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-hidden button has no id attribute (W2466)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-hidden <button> does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-hidden");

    // Sanity: confirm we pinned the actual chip-hidden <button>
    // wrapper and not a child span. The Chip helper emits a <button>
    // for keyboard accessibility, and going through
    // `data-testid="chip-hidden"` would resolve a child element if
    // any future refactor moved the testid down onto an inner span —
    // which would itself be a regression.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `id` attribute on chip-hidden. Use
    // `hasAttribute` rather than checking for an empty string — an
    // `id=""` would still be a (broken) public surface that future code
    // could come to depend on, and `getAttribute("id")` returning ""
    // would silently pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("id")).toBe(false);
  });
});
