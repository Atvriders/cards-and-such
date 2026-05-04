import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1377 — the desktop drawer collapse/expand toggle button carries an
 * explicit `className="lobby-drawer-toggle"` CSS hook. The drawer's
 * stylesheet (`web/src/pages/LobbyPage.css`) attaches the toggle's
 * absolute positioning, hover affordances, focus ring, and collapsed-
 * rail offset to this exact selector. Without the class, the toggle
 * would visually disintegrate (no shape, no positioning, no hover) —
 * but every existing test would still pass because all of them resolve
 * the toggle by `data-testid="lobby-drawer-toggle"`, which happens to
 * share the same string but is a SEPARATE DOM contract.
 *
 * Existing sibling pins on the toggle:
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the swapping
 *     `aria-label` / `title` / glyph triple (and `aria-expanded`).
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx pins the inner
 *     `<span aria-hidden="true">` glyph child.
 *   - W1357 / LobbyDrawerToggleType.test.tsx pins `type="button"` and
 *     `tagName === "BUTTON"`.
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid.
 *
 * None of those assert the toggle's `className`. A refactor that
 * lifted the class onto a different sibling, renamed it, or replaced
 * `className=` with a different CSS strategy (e.g. CSS modules with a
 * hashed class name) would silently break every CSS rule targeting
 * `.lobby-drawer-toggle` without tripping any existing test. This file
 * fills exactly that gap.
 *
 * Lives in a NEW SIBLING file (not LobbyDrawerToggleLabel.test.tsx or
 * LobbyPage.test.tsx) to follow the established convention in this
 * directory and avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle className CSS hook (W1377)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1134 / W1265 / W1357
    // sibling harnesses: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer aside
    // (and its toggle button) would not mount.
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

  it("the drawer toggle button carries className=\"lobby-drawer-toggle\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const toggle = screen.getByTestId("lobby-drawer-toggle");
    // Use classList.contains (exact-match list-contains, not substring)
    // so a stray `lobby-drawer-toggle-foo` rename does NOT accidentally
    // satisfy this assertion.
    expect(toggle.classList.contains("lobby-drawer-toggle")).toBe(true);
  });
});
