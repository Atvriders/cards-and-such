import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2227 — the OUTER `<div class="lobby-page">` element that wraps the
 * entire lobby (drawer + main content) intentionally carries NO
 * `tabindex` attribute. The wrapper is a non-interactive structural
 * container styled exclusively via the `lobby-page` className; it is
 * not a focus target, not a roving-tabindex root, and not part of any
 * keyboard-navigation contract — those responsibilities live on the
 * inner drawer rows (LobbyDrawerLink* family) and grid tiles (the
 * roving-tabindex pattern pinned by W295/W355/W545 inside
 * LobbyPage.test.tsx).
 *
 * Why this needs its own pin:
 *  - Sibling pins on the same outer element cover the attributes that
 *    DO appear (W1179 / LobbyDrawerOuterClass — the
 *    `lobby-page--drawer-collapsed` modifier toggle) and the absences
 *    that are already pinned (W2091 / LobbyPageRootNoId — no `id`;
 *    W2165 / LobbyPageRootNoStyle — no inline `style`), but none
 *    assert the ABSENCE of a `tabindex` attribute. A drive-by refactor
 *    that adds e.g. `tabIndex={-1}` (to make the wrapper a programmatic
 *    focus target for skip-links) or `tabIndex={0}` (silently inserting
 *    the wrapper into the natural tab order ahead of the drawer toggle)
 *    would shift the page's keyboard-navigation surface out of the
 *    inner roving-tabindex containers and onto the structural shell —
 *    defeating the "wrapper is non-interactive" contract that the rest
 *    of the Lobby* test family enforces (LobbyDrawerAsideNoTabIndex
 *    pins the same invariant on the sibling drawer aside; this test
 *    pins it on the outer page-root wrapper itself).
 *  - Mirrors the established *.NoTabIndex.test.tsx family pattern: pin
 *    the "no tabindex" invariant at the same granularity as the
 *    "has X" / "no id" / "no style" invariants on the same element.
 *
 * Lives in a NEW SIBLING file (not appended to LobbyPage.test.tsx) to
 * follow the established convention in this directory and keep the
 * assertion under the `src/pages/Lobby` vitest filter without
 * colliding with concurrent test additions.
 */
describe("LobbyPage — outer page-root wrapper has no tabindex attribute (W2227)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render a tabindex attribute on the .lobby-page outer wrapper", () => {
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
    // inspecting `.tabIndex` — the IDL `tabIndex` property always
    // resolves to a number (default `-1` for non-focusable elements,
    // or `0` if the element is in the natural tab order via other
    // means), so it cannot distinguish "attribute absent" from
    // "attribute present with value -1". `hasAttribute` is the only
    // way to pin the literal absence of the DOM attribute.
    expect(root.hasAttribute("tabindex")).toBe(false);
  });
});
