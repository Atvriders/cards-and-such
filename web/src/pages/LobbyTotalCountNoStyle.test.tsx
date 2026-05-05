import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2139 — the lobby-hero total-count line (the `<p class="lobby-sub"
 * data-testid="lobby-total-count">` rendered around line 1856 of
 * LobbyPage.tsx) MUST NOT carry an inline `style` attribute. Its visual
 * presentation is owned entirely by the `.lobby-sub` CSS class.
 *
 * Sibling pins on this same total-count element:
 *   - LobbyHeroTotalCount.test.tsx pins the rendered text content
 *     ("<GAMES.length> games and counting — …").
 *   - LobbyPageRootNoId.test.tsx uses lobby-total-count as a stable
 *     anchor while pinning the absence of an `id` on the page root.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the total-count paragraph itself. A future refactor that introduced
 * e.g. `style={{ color: "var(--accent)" }}` or a JS-driven
 * `style={{ opacity: tween }}` for an animated count-up would silently:
 *   1. Bypass the established stylesheet contract for this element,
 *      making theme/dark-mode/print overrides in CSS impossible to
 *      apply without `!important` workarounds.
 *   2. Couple the component's render output to per-render numeric
 *      animation state, defeating the simple static-text contract the
 *      sibling LobbyHeroTotalCount test relies on.
 *   3. Defeat CSP `style-src` policies that disallow inline styles, which
 *      this app's deployment is free to adopt today precisely because the
 *      total-count paragraph carries no inline style.
 *
 * One focused assertion: the lobby-total-count element MUST NOT carry a
 * `style` attribute. If a future change deliberately needs inline style
 * (e.g., JS-controlled count-up animation), it should add the new
 * attribute AND update this pin in the same commit, making the trade-off
 * explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2112 / LobbyChipStripNoStyle pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — total-count paragraph has no inline style attribute (W2139)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-total-count paragraph does NOT carry a style attribute", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const sub = getByTestId("lobby-total-count");

    // Sanity: confirm we pinned the hero subtitle paragraph and not,
    // say, a wrapper that some future restructure could re-target the
    // testid to. Without this guard a relocation onto a styled wrapper
    // could pass the no-style assertion vacuously.
    expect(sub.tagName).toBe("P");
    expect(sub.classList.contains("lobby-sub")).toBe(true);

    // The actual contract: no `style` attribute on the total-count
    // paragraph. Use `hasAttribute` rather than inspecting
    // `.style.cssText` — an empty `style=""` would still be a (broken)
    // public surface that future code or CSP-violation reporters could
    // come to depend on, and DOM `.style` reflection would silently mask
    // its presence.
    expect(sub.hasAttribute("style")).toBe(false);
  });
});
