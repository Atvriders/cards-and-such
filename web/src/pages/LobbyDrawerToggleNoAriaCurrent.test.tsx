import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2746 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-current` attribute. `aria-current` semantically marks
 * the element representing the current item within a set (e.g. the
 * active link in a navigation list, the current page in pagination,
 * the current step in a wizard). The drawer toggle is a disclosure
 * control — it opens/closes the drawer aside; it is NOT a member of a
 * set of "current vs. non-current" peers.
 *
 * Adding `aria-current` here would mislead assistive tech into
 * announcing the toggle as the "current page/step/item", competing
 * with the actual `aria-current="page"` pinned on the active drawer
 * link (W?/LobbyDrawerLinkAriaCurrent.test.tsx). Two elements
 * announcing themselves as "current" within the same drawer region is
 * exactly the confusion the WAI-ARIA spec warns against.
 *
 * Pinning `aria-current` absence here closes another loop: a future
 * change that mirrored "drawer-open" state via
 * `aria-current={!drawerCollapsed ? "true" : undefined}` would be a
 * regression — every existing sibling pin (label/title/glyph/type/
 * class/tabindex/id/aria-controls/aria-disabled/aria-pressed/
 * aria-checked/aria-selected/disabled/form/name/value/autofocus)
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
 *   - W???? / LobbyDrawerToggleNoAriaChecked.test.tsx   — no aria-checked
 *   - W???? / LobbyDrawerToggleNoAriaSelected.test.tsx  — no aria-selected
 *   - W???? / LobbyDrawerToggleNoDisabled.test.tsx      — no disabled
 *   - W???? / LobbyDrawerToggleNoForm.test.tsx          — no form
 *   - W???? / LobbyDrawerToggleNoName.test.tsx          — no name
 *   - W???? / LobbyDrawerToggleNoValue.test.tsx         — no value
 *   - W???? / LobbyDrawerToggleNoAutofocus.test.tsx     — no autofocus
 *   - W625  / LobbyPage.test.tsx                        — aria-expanded toggle
 *
 * None of the above assert the absence of `aria-current`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no aria-current attribute (W2746)", () => {
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

  it("the drawer toggle button has no aria-current attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The toggle is a disclosure control — it is not a member of a set
    // of "current vs. non-current" peers. `aria-current` belongs on
    // the active drawer LINK (pinned separately), not on the
    // open/close button. Adding it here would create a duplicate,
    // conflicting "current item" announcement within the drawer.
    expect(btn.hasAttribute("aria-current")).toBe(false);
  });
});
