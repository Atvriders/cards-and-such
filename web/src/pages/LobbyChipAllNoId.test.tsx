import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2414 — the LobbyPage `chip-all` Chip <button> MUST NOT carry an `id`
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
 * chip itself. Adding one would silently:
 *   1. Create a stable URL fragment target (`/#chip-all`) that external
 *      links and bookmarks could come to depend on, making it an
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
 * Sibling pins on the SAME chip-all <button> currently in the suite:
 *   - W1962 / LobbyChipTag pins `tagName === "BUTTON"` on every chip.
 *   - W1258 / LobbyChipType pins `type="button"` on chip-all.
 *   - W1501 / LobbyChipWrapClass pins `classList.contains("lobby-chip")`.
 *   - W2146 / LobbyChipAllNoStyle pins the absence of an inline `style`.
 *   - W608 / W2415 in LobbyPage.test.tsx pin `aria-pressed` /
 *     `aria-selected` / `role="tab"`.
 *
 * What NONE of those cover is the absence of an `id` attribute on the
 * chip-all <button> itself. A regression introducing
 * `id="chip-all"` (a tempting symmetry with `data-testid="chip-all"`)
 * would slip through every existing pin.
 *
 * Mirrors the W2041 / LobbyChipsWrapNoId, W2146 / LobbyChipAllNoStyle
 * single-attribute-pin pattern. Resolves the chip via its stable
 * `data-testid="chip-all"` (LobbyPage.tsx ~L1935) so the assertion is
 * locale-independent and immune to translation-key changes.
 */
describe("LobbyPage — chip-all button has no id attribute (W2414)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the chip-all <button> does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all");

    // Sanity: confirm we pinned the actual chip-all <button> wrapper and
    // not a child span. The Chip helper emits a <button> for keyboard
    // accessibility, and going through `data-testid="chip-all"` would
    // resolve a child element if any future refactor moved the testid
    // down onto an inner span — which would itself be a regression.
    expect(chip.tagName).toBe("BUTTON");

    // The actual contract: no `id` attribute on chip-all. Use
    // `hasAttribute` rather than checking for an empty string — an
    // `id=""` would still be a (broken) public surface that future code
    // could come to depend on, and `getAttribute("id")` returning ""
    // would silently pass a `.toBeFalsy()` style assertion.
    expect(chip.hasAttribute("id")).toBe(false);
  });
});
