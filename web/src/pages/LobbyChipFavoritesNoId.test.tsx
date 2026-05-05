import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2450 — the LobbyPage `chip-favorites` Chip <button> MUST NOT carry an
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
 * favorites chip itself. Adding one would silently:
 *   1. Create a stable URL fragment target (`/#chip-favorites`) that
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
 * Sibling pins on `chip-favorites` already in the suite cover OTHER
 * attributes but NOT the `id` absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-favorites.
 *   - W1158 / LobbyFavoritesChipBadgeZero pins the count-badge text
 *     content as "0" on a fresh mount.
 *   - W1470 / LobbyChipFavoritesGlyphAria pins the "♥" glyph and its
 *     `aria-hidden="true"` attribute.
 *   - LobbyPage.test.tsx pins `aria-pressed` on chip-favorites both at
 *     default mount ("false") and after click ("true").
 *
 * The closest analogue is W2429 / LobbyChipDiceNoId, which pins the same
 * `id`-absence contract on chip-dice (a per-category chip rendered
 * through the `CATEGORY_ORDER.map` branch). chip-favorites is rendered
 * through the *static* JSX branch at LobbyPage.tsx ~L1943-1949 — a
 * different code path. A regression that added `id={testId}` (a tempting
 * symmetry with `data-testid={testId}`) only to the static favorites/
 * recently-played/hidden chips while leaving the dynamic per-category
 * branch alone would slip through W2429. This file closes that gap on
 * chip-favorites specifically.
 *
 * Resolves the chip via its stable `data-testid="chip-favorites"`
 * (rendered through `testId="chip-favorites"` at LobbyPage.tsx ~L1947)
 * so the assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-favorites button has no id attribute (W2450)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-favorites <button> does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-favorites");

    // Sanity: confirm we pinned the actual chip-favorites <button>
    // wrapper and not a child span. The Chip helper emits a <button>
    // for keyboard accessibility, and going through
    // `data-testid="chip-favorites"` would resolve a child element if
    // any future refactor moved the testid down onto an inner span —
    // which would itself be a regression.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `id` attribute on chip-favorites. Use
    // `hasAttribute` rather than checking for an empty string — an
    // `id=""` would still be a (broken) public surface that future code
    // could come to depend on, and `getAttribute("id")` returning ""
    // would silently pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("id")).toBe(false);
  });
});
