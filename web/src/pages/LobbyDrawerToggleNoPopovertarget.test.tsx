import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2763 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry a `popovertarget` attribute. The toggle is a disclosure
 * control whose collapsed/expanded state is communicated entirely via
 * `aria-expanded` (pinned by W625 in LobbyPage.test.tsx through the
 * click->data-collapsed contract) and whose visual state is owned by
 * the parent aside's `data-collapsed` attribute.
 *
 * `popovertarget` (HTML Popover API) wires a button up to invoke a
 * sibling element marked with the `popover` attribute — pressing the
 * button toggles that popover via the browser's top-layer machinery
 * (light-dismiss, ESC-close, automatic anchor positioning, etc.).
 * Adding `popovertarget` here would silently hijack the button's
 * click semantics: the browser would attempt to find/show/hide a
 * popover element, competing with React's own `setDrawerCollapsed`
 * handler and breaking the pinned aria-expanded/data-collapsed
 * round-trip. The drawer aside is NOT a popover (it has no `popover`
 * attribute, no top-layer behavior, and is a permanent landmark
 * region pinned as such by LobbyDrawerAside* tests).
 *
 * Pinning `popovertarget` absence here closes the loop: a future
 * change that "modernized" the toggle to use the HTML Popover API
 * (e.g. `popovertarget="lobby-drawer"`) without first migrating the
 * drawer to a real popover semantic would be a regression — every
 * existing sibling pin (label/title/glyph/type/class/tabindex/id/
 * aria-controls/aria-disabled/aria-pressed/aria-selected/aria-checked
 * /aria-current/aria-haspopup/disabled/form/name/value/autofocus)
 * would still pass.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx           — aria-label/title/glyph
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx     — inner span aria-hidden
 *   - W1357 / LobbyDrawerToggleType.test.tsx            — type="button" + BUTTON tag
 *   - W1377 / LobbyDrawerToggleClass.test.tsx           — className CSS hook
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx      — no explicit tabindex
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx            — no id attribute
 *   - W2431 / LobbyDrawerToggleNoAriaControls.test.tsx  — no aria-controls
 *   - W???? / LobbyDrawerToggleNoAriaDisabled.test.tsx  — no aria-disabled
 *   - W2740 / LobbyDrawerToggleNoAriaPressed.test.tsx   — no aria-pressed
 *   - W2744 / LobbyDrawerToggleNoAriaChecked.test.tsx   — no aria-checked
 *   - W???? / LobbyDrawerToggleNoAriaSelected.test.tsx  — no aria-selected
 *   - W???? / LobbyDrawerToggleNoAriaCurrent.test.tsx   — no aria-current
 *   - W???? / LobbyDrawerToggleNoAriaHaspopup.test.tsx  — no aria-haspopup
 *   - W???? / LobbyDrawerToggleNoDisabled.test.tsx      — no disabled
 *   - W???? / LobbyDrawerToggleNoForm.test.tsx          — no form
 *   - W???? / LobbyDrawerToggleNoName.test.tsx          — no name
 *   - W???? / LobbyDrawerToggleNoValue.test.tsx         — no value
 *   - W???? / LobbyDrawerToggleNoAutofocus.test.tsx     — no autofocus
 *   - W625  / LobbyPage.test.tsx                        — aria-expanded toggle
 *
 * None of the above assert the absence of `popovertarget`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no popovertarget attribute (W2763)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the sibling pins:
    // widen jsdom's innerWidth above the breakpoint AND stub matchMedia
    // so the lobby's `(min-width: 1024px)` query resolves "desktop"
    // before render — without this the drawer aside (and its toggle
    // button) would not mount.
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

  it("the drawer toggle button has no popovertarget attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The toggle is a React-driven disclosure control, not a popover
    // invoker. `popovertarget` would hand click semantics to the
    // browser's HTML Popover API (top-layer show/hide), competing
    // with `setDrawerCollapsed` and breaking the pinned
    // aria-expanded/data-collapsed round-trip.
    expect(btn.hasAttribute("popovertarget")).toBe(false);
  });
});
