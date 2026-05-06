import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2732 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry a `name` attribute. The `name` attribute on a `<button>` is
 * only meaningful inside a `<form>` (where it becomes the submission
 * key for the button's `value`); outside that context it is dead
 * weight that misleads tooling (e.g. accessibility scanners that read
 * `name` as a fallback accessible name) and adds another addressing
 * surface that downstream code could latch onto. The toggle is
 * uniquely addressable via its stable `data-testid="lobby-drawer-toggle"`
 * hook and its `className="lobby-drawer-toggle"` CSS hook; an
 * accessible name is already provided by the swapping `aria-label`
 * (W1134). A regression that added `name="drawer-toggle"` — perhaps
 * to wire up a future hidden form, or as a copy-paste from a search
 * input nearby — would silently introduce that latent surface and
 * pass every other existing assertion on the toggle.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the swapping
 *     `aria-label` / `title` / glyph triple.
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx pins the inner
 *     `<span aria-hidden="true">` glyph child.
 *   - W1357 / LobbyDrawerToggleType.test.tsx pins `type="button"` and
 *     `tagName === "BUTTON"`.
 *   - W1377 / LobbyDrawerToggleClass.test.tsx pins the
 *     `className="lobby-drawer-toggle"` CSS hook.
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx pins absence of
 *     an explicit `tabindex` override.
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx pins absence of an `id`.
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no name attribute (W2732)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W2387 / W1377 / W1134
    // / W1265 / W1357 / W2312 sibling harnesses: widen jsdom's innerWidth
    // above the breakpoint AND stub matchMedia so the lobby's
    // `(min-width: 1024px)` query resolves "desktop" before render —
    // without this the drawer aside (and its toggle button) would not mount.
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

  it("the drawer toggle button has no name attribute (it's not a form control)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no `name` on the toggle button. The button
    // lives outside any `<form>`, so `name` would be inert at best and
    // misleading at worst — the testid+className already provide the
    // canonical addressing hooks, and `aria-label` provides the
    // accessible name.
    expect(btn.hasAttribute("name")).toBe(false);
  });
});
