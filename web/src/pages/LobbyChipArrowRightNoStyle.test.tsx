import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2816 — the chip strip's RIGHT overflow scroll-arrow button is rendered
 * WITHOUT an inline `style` attribute. The arrow's visual presentation
 * (positioning, width, glyph alignment, hidden-on-no-overflow behaviour)
 * is owned entirely by the `.lobby-chips-arrow` / `.lobby-chips-arrow--right`
 * CSS classes in `LobbyPage.css` (see ~L480: `.lobby-chips-arrow--right
 * { right: -4px; }`), not by any inline style prop.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowRightTagName.test.tsx (W2371) pins the BUTTON tagName,
 *    LobbyChipArrowRightType.test.tsx (W1408) pins `type="button"`,
 *    LobbyChipArrowRightTabIndex.test.tsx (W1746) pins `tabIndex={-1}`,
 *    LobbyChipArrowRightNoId.test.tsx (W2444) pins the absence of `id`,
 *    LobbyChipArrowRightNoDraggable.test.tsx (W2793) pins no `draggable`,
 *    and LobbyPage.test.tsx (~L2260) reads `aria-label` and `hidden`.
 *    None of those pins would notice if a refactor introduced an inline
 *    style — e.g. `style={{ right: "-4px" }}` migrated from CSS, or a
 *    JS-driven `style={{ opacity: canRight ? 1 : 0 }}` to replace the
 *    `hidden` attribute, or a per-render `style` to compute width from
 *    measured glyph metrics.
 *  - Sibling no-inline-style pins on the lobby surface:
 *      W2146 / LobbyChipAllNoStyle.test.tsx pins the chip-all button.
 *      W2112 / LobbyChipStripNoStyle.test.tsx pins the chip-strip track.
 *      LobbyDrawerAsideNoStyle.test.tsx pins the drawer aside.
 *      LobbyAllGamesNoStyle.test.tsx pins the all-games tile.
 *      LobbyPageRootNoStyle.test.tsx pins the LobbyPage root.
 *    None of those cover the right scroll-arrow specifically.
 *
 * What introducing an inline `style` attribute here would silently do:
 *   1. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app is free to adopt today precisely because the arrow emits
 *      no inline style.
 *   2. Bypass the `.lobby-chips-arrow--right` stylesheet contract — theme
 *      / dark-mode CSS overrides would lose specificity battles against
 *      the per-element inline declaration without `!important` workarounds.
 *   3. If style mirrored geometry (e.g. computed width / right offset),
 *      reintroduce per-render layout-thrash patterns the strip-level
 *      scroll design specifically avoids via refs + event listeners.
 *
 * The button is rendered with `hidden` toggled by overflow geometry on
 * first paint, so we resolve it by stable BEM modifier class via
 * `document.querySelector` rather than via `getByRole("button", { name })`,
 * which skips hidden elements (matching the resolution strategy used in
 * sibling LobbyChipArrowRight*.test.tsx files).
 *
 * `hasAttribute` is the literal-attribute check: an empty `style=""` would
 * still be a (broken) public surface that future code or CSP-violation
 * reporters could depend on, and DOM `.style.cssText` reflection would
 * silently mask the presence of an empty `style` attribute. Pinning
 * `hasAttribute` catches both regressions (added-with-content and
 * added-empty).
 */
describe("LobbyPage — chip-strip RIGHT arrow has no inline style attribute (W2816)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow without a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // Sanity: confirm the resolved node is the actual <button>, not a
    // descendant or wrapper that happens to share the modifier class.
    // Without this guard a future restructure could pass the assertion
    // vacuously by moving the class onto a non-styled wrapper.
    expect(right!.tagName).toBe("BUTTON");

    // The actual contract: no `style` attribute on the right arrow.
    expect(right!.hasAttribute("style")).toBe(false);
  });
});
