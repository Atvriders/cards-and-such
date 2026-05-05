import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2387 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `id` attribute. The toggle is uniquely addressable via its
 * stable `data-testid="lobby-drawer-toggle"` hook (used by tests) and
 * via its `className="lobby-drawer-toggle"` CSS hook (used by styles
 * and `LobbyPage.css`). Adding an `id` to the button would invite
 * cross-document collisions (the lobby is reachable as the home page
 * and embedded fragments may live in shared DOMs), and would create a
 * second, unsanctioned addressing path that downstream code could
 * latch onto — defeating the testid-only contract that the rest of
 * the toggle's coverage already takes for granted.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the swapping
 *     `aria-label` / `title` / glyph triple.
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx pins the inner
 *     `<span aria-hidden="true">` glyph child.
 *   - W1357 / LobbyDrawerToggleType.test.tsx pins `type="button"` and
 *     `tagName === "BUTTON"`.
 *   - W1377 / LobbyDrawerToggleClass.test.tsx pins the
 *     `className="lobby-drawer-toggle"` CSS hook (via classList).
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx pins absence of
 *     an explicit `tabindex` override.
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid (and the default `aria-expanded="true"`).
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * toggle button itself. A regression that added (e.g.) `id="drawer-toggle"`
 * — perhaps to wire up an `aria-controls` reference from a header link,
 * or to support a quick anchor-jump — would (a) introduce a duplicate
 * addressing surface, and (b) risk an id collision the moment two
 * lobbies render in the same document tree. Either change passes every
 * existing assertion above.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no id attribute (W2387)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1377 / W1134 / W1265
    // / W1357 / W2312 sibling harnesses: widen jsdom's innerWidth above
    // the breakpoint AND stub matchMedia so the lobby's `(min-width: 1024px)`
    // query resolves "desktop" before render — without this the drawer
    // aside (and its toggle button) would not mount.
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

  it("the drawer toggle button has no id attribute (testid+className are the canonical hooks)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no `id` on the toggle button. Both the
    // testid (for tests) and className (for CSS) are sufficient to
    // address it; an explicit id would be a redundant addressing path
    // and a latent collision risk in shared-DOM scenarios.
    expect(btn.hasAttribute("id")).toBe(false);
  });
});
