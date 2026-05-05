import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2482 — the LobbyPage `chip-arcade` Chip <button> MUST NOT carry an `id`
 * attribute. The Chip helper (LobbyPage.tsx ~L2651-2666) emits exactly
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
 * per-category chip itself. Adding one would silently:
 *   1. Create a stable URL fragment target (`/#chip-arcade`) that
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
 * Sibling pins on `chip-arcade` already in the suite cover OTHER
 * attributes but NOT the `id` absence:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip
 *     including chip-arcade.
 *   - W1435 / LobbyChipArcadeBadge pins the count-badge text content
 *     against the registry's arcade count.
 *   - W1507 / LobbyChipArcadeGlyphAria pins the "✦" glyph +
 *     `aria-hidden="true"` on the chip-arcade glyph span.
 *   - W2467 / LobbyChipArcadeType pins the explicit `type="button"`
 *     attribute on the chip-arcade wrapper.
 *
 * The closest analogues are W2414 / LobbyChipAllNoId (pins `id`-absence
 * on `chip-all`) and W2429 / LobbyChipDiceNoId (pins it on `chip-dice`).
 * Because the `<Chip>` helper is shared, a regression that introduced
 * `id={testId}` on chip-all would fail W2414 — but a regression that
 * added `id` to JUST the per-category chips (e.g. via the inline
 * `CATEGORY_ORDER.map` at LobbyPage.tsx ~L1964 passing an extra prop
 * only on the dynamic branch) would slip through every existing pin
 * unless every per-category chip is independently pinned. This file
 * closes that gap on chip-arcade.
 *
 * Resolves the chip via its stable `data-testid="chip-arcade"` (rendered
 * through `testId={`chip-${cat}`}` at LobbyPage.tsx ~L1970) so the
 * assertion is locale-independent and immune to translation-key
 * changes.
 */
describe("LobbyPage — chip-arcade button has no id attribute (W2482)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-arcade <button> does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-arcade");

    // Sanity: confirm we pinned the actual chip-arcade <button> wrapper
    // and not a child span. The Chip helper emits a <button> for
    // keyboard accessibility, and going through
    // `data-testid="chip-arcade"` would resolve a child element if any
    // future refactor moved the testid down onto an inner span — which
    // would itself be a regression.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `id` attribute on chip-arcade. Use
    // `hasAttribute` rather than checking for an empty string — an
    // `id=""` would still be a (broken) public surface that future code
    // could come to depend on, and `getAttribute("id")` returning ""
    // would silently pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("id")).toBe(false);
  });
});
