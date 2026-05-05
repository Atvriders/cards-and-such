import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2165 — the OUTER `<div class="lobby-page">` element that wraps the
 * entire lobby (drawer + main content) intentionally carries NO inline
 * `style` attribute. The wrapper is styled exclusively through the
 * `lobby-page` className (and the `lobby-page--drawer-collapsed`
 * modifier pinned by W1179); nothing in the page (or its CSS) drives
 * dynamic per-render inline styles on this wrapper.
 *
 * Why this needs its own pin:
 *  - Sibling pins on the same outer element cover the attributes that
 *    DO appear (W1179 / LobbyDrawerOuterClass — the
 *    `lobby-page--drawer-collapsed` modifier toggle; W2091 /
 *    LobbyPageRootNoId — the absence of an `id`), but none assert the
 *    ABSENCE of an inline `style` attribute. A drive-by refactor that
 *    adds e.g. `style={{ minHeight: ... }}` or a CSS custom-property
 *    handoff (`style={{ "--lobby-drawer-w": ... } as CSSProperties}`)
 *    would silently shift styling out of the stylesheet and into the
 *    DOM — defeating the className-only contract that the rest of the
 *    Lobby* test family enforces on every other lobby element
 *    (LobbyChipAllNoStyle, LobbyChipStripNoStyle, LobbyGridNoStyle,
 *    LobbyH1NoStyle, LobbyDrawerAsideNoStyle, LobbyDrawerLinkNoStyle,
 *    LobbyTileChipsNoStyle, LobbyTileFootNoStyle, LobbyTileMetaNoStyle,
 *    LobbyTileSheenNoStyle, LobbyTileStripeNoStyle, LobbyToolbarNoStyle,
 *    LobbyTotalCountNoStyle, …).
 *  - Mirrors the established *.NoStyle.test.tsx family pattern: pin the
 *    "no style" invariant at the same granularity as the "has X"
 *    invariants on the same element.
 *
 * Lives in a NEW SIBLING file (not appended to LobbyPage.test.tsx) to
 * follow the established convention in this directory and keep the
 * assertion under the `src/pages/Lobby` vitest filter without
 * colliding with concurrent test additions.
 */
describe("LobbyPage — outer page-root wrapper has no style attribute (W2165)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render a style attribute on the .lobby-page outer wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor via a stable child testid that is rendered at every
    // viewport width (the drawer is desktop-only, so we use the
    // always-present `lobby-total-count` instead), then walk up to
    // the closest `.lobby-page` wrapper. The wrapper has no testid of
    // its own by design.
    const anchor = screen.getByTestId("lobby-total-count");
    const root = anchor.closest(".lobby-page") as HTMLElement | null;
    expect(root).not.toBeNull();
    if (!root) return;

    // Sanity: we resolved the right element before pinning the
    // negative invariant.
    expect(root.classList.contains("lobby-page")).toBe(true);

    // Pin the literal absence. Use `hasAttribute` rather than
    // inspecting `.style.cssText` — an empty `style=""` attribute
    // still counts as "present" for the className-only contract this
    // test enforces, and `.style.cssText` would treat it as absent.
    expect(root.hasAttribute("style")).toBe(false);
  });
});
