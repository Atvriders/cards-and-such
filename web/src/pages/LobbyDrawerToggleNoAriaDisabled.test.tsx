import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2651 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-disabled` attribute. The toggle is the user's only
 * handle for the lobby drawer's collapsed/expanded contract — marking
 * it `aria-disabled` (even without setting the native `disabled`
 * property) would tell assistive technologies that the control is
 * inert, which is at odds with the actual behavior: the button is
 * always interactive on desktop and, on click, flips `data-collapsed`
 * on the surrounding `<aside data-testid="lobby-drawer">`.
 *
 * Sibling pin W2455 / LobbyDrawerToggleNoDisabled.test.tsx already pins
 * absence of the native `disabled` attribute / property on this same
 * button. That test does NOT, however, witness the ARIA mirror: a
 * regression that added `aria-disabled="true"` (e.g. to convey a
 * "hydrating" state to screen readers without actually disabling the
 * click handler) would slip past every existing assertion on the
 * toggle while still misleading AT users into thinking the drawer
 * cannot be collapsed/expanded.
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
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx pins absence of an `id`.
 *   - W2431 / LobbyDrawerToggleNoAriaControls.test.tsx pins absence of
 *     an `aria-controls` linkage.
 *   - W2455 / LobbyDrawerToggleNoDisabled.test.tsx pins absence of the
 *     native `disabled` attribute / property.
 *
 * What none of those cover is the ABSENCE of `aria-disabled` on the
 * toggle button. This file plugs that hole.
 *
 * Lives in a NEW SIBLING file to follow the established convention in
 * this directory (every distinct lobby attribute pin lives in its own
 * file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no aria-disabled attribute (W2651)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the sibling W2455 /
    // W2387 / W2431 / W2312 / W1377 harnesses: widen jsdom's
    // innerWidth above the breakpoint AND stub matchMedia so the
    // lobby's `(min-width: 1024px)` query resolves "desktop" before
    // render — without this the drawer aside (and its toggle button)
    // would not mount.
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

  it("the drawer toggle button has no `aria-disabled` attribute (AT-interactive contract)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: the toggle is always interactive on
    // desktop, both for sighted users (W2455) and for assistive
    // technologies. A regression that added `aria-disabled="true"`
    // (or even `aria-disabled="false"`, which is still ARIA noise on
    // a button that should communicate its state purely through
    // `aria-expanded`) would mislead screen readers about the
    // drawer's reachability. Pin literal attribute absence.
    expect(btn.hasAttribute("aria-disabled")).toBe(false);
  });
});
