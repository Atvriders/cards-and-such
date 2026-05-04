import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1179 — the OUTER `<div class="lobby-page">` element that wraps the
 * entire lobby (drawer + main content) gains an additional modifier
 * class `lobby-page--drawer-collapsed` whenever the desktop category
 * drawer is collapsed, and that modifier is removed when the drawer is
 * re-expanded. The CSS rules that re-flow the main grid (shifting the
 * tile area to fill the gap left by the collapsed drawer rail) hang
 * off this modifier — without the class the layout would still render
 * with the wide drawer column reserved, leaving an empty gutter.
 *
 * Existing sibling pins around the drawer:
 *   - W295  / LobbyPage.test.tsx — drawer toggle click flips
 *     `aria-expanded`.
 *   - W355  / LobbyPage.test.tsx — drawer collapsed state persists in
 *     localStorage under `cards-lobby-drawer-collapsed`.
 *   - W374  / LobbyPage.test.tsx — drawer mounts only at desktop
 *     widths (>=1024px).
 *   - W625  / LobbyPage.test.tsx — drawer aside's `data-collapsed`
 *     attribute mirrors the boolean state.
 *   - W644  / LobbyDrawerWidth.test.tsx — resize handle persists width.
 *   - W659  / LobbyDrawerEnter.test.tsx — Enter on a drawer link
 *     activates the filter.
 *   - W812  / LobbyDrawerToggleLabel — was lost; re-pinned by W1134.
 *   - W908  / LobbyChipStripAria.test.tsx — chip-strip tablist label.
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx — toggle aria-label /
 *     title / glyph all flip together.
 *   - W1153 / inner nav's `aria-label="Filter by category (drawer)"`.
 *   - W1167 / LobbyDrawerAside.test.tsx — outer aside's
 *     `aria-label="Lobby categories"`.
 *
 * The OUTER `lobby-page` wrapper's own modifier class has never been
 * pinned. A refactor that moved the collapsed-state styling onto a
 * different element (e.g. directly onto the aside, or onto a new inner
 * wrapper) would silently break every CSS rule that targets
 * `.lobby-page--drawer-collapsed .lobby-tile-grid` and friends without
 * tripping any current test. This file fills exactly that gap with one
 * focused assertion.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established convention in this directory.
 */
describe("LobbyPage — outer wrapper drawer-collapsed modifier (W1179)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1134 / W1167 / W908
    // siblings: widen jsdom's innerWidth above the breakpoint AND stub
    // matchMedia so the lobby's `(min-width: 1024px)` query resolves
    // "desktop" before render — without this the drawer toggle would
    // not mount and the test would always fail for the wrong reason.
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: /min-width:\s*1024/.test(query),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("toggling the drawer adds/removes `lobby-page--drawer-collapsed` on the outer wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor via the drawer's stable testid, then walk up to the
    // closest `.lobby-page` wrapper — this is the OUTER element the
    // modifier class hangs off of, distinct from the drawer aside
    // itself (which is pinned for `data-collapsed` by W625).
    const aside = screen.getByTestId("lobby-drawer");
    const outer = aside.closest(".lobby-page") as HTMLElement | null;
    expect(outer).not.toBeNull();
    if (!outer) return;

    // Initial render: drawer is expanded (default localStorage absent),
    // so the modifier class must NOT be present.
    expect(outer.classList.contains("lobby-page")).toBe(true);
    expect(outer.classList.contains("lobby-page--drawer-collapsed")).toBe(false);

    // Click the toggle to collapse — the modifier should appear.
    const toggle = screen.getByTestId("lobby-drawer-toggle");
    act(() => {
      fireEvent.click(toggle);
    });
    expect(outer.classList.contains("lobby-page--drawer-collapsed")).toBe(true);

    // Click again to re-expand — the modifier should disappear.
    act(() => {
      fireEvent.click(toggle);
    });
    expect(outer.classList.contains("lobby-page--drawer-collapsed")).toBe(false);
  });
});
