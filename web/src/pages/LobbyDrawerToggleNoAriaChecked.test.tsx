import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2744 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-checked` attribute. The toggle is a disclosure
 * control (a plain BUTTON), NOT a checkbox/switch/radio: its
 * open/closed state is communicated entirely via `aria-expanded`
 * (pinned by W625 in LobbyPage.test.tsx through the
 * click->data-collapsed contract).
 *
 * `aria-checked` is only valid on roles that support a tri-state
 * "checked" semantic (checkbox, radio, switch, menuitemcheckbox,
 * menuitemradio, treeitem, option). Applying `aria-checked` to a
 * generic disclosure button is an ARIA antipattern — assistive tech
 * would either ignore it (silent contract drift) or, on roles that
 * accept it, announce a competing state alongside `aria-expanded`
 * ("expanded/collapsed" vs. "checked/unchecked") for the same
 * underlying boolean. The WAI-ARIA Authoring Practices explicitly
 * warn against mixing role-state semantics like this.
 *
 * Pinning `aria-checked` absence here closes the loop: a future
 * change that pre-emptively added `aria-checked={!drawerCollapsed}`
 * to "mirror" `aria-expanded` (or that swapped the toggle to
 * role="switch" without the necessary semantics) would be a
 * regression — every existing sibling pin (label/title/glyph/type
 * /class/tabindex/id/aria-controls/aria-disabled/aria-pressed
 * /aria-selected/disabled/form/name/value/autofocus) would still
 * pass.
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
 *   - W???? / LobbyDrawerToggleNoAriaSelected.test.tsx  — no aria-selected
 *   - W???? / LobbyDrawerToggleNoDisabled.test.tsx      — no disabled
 *   - W???? / LobbyDrawerToggleNoForm.test.tsx          — no form
 *   - W???? / LobbyDrawerToggleNoName.test.tsx          — no name
 *   - W???? / LobbyDrawerToggleNoValue.test.tsx         — no value
 *   - W???? / LobbyDrawerToggleNoAutofocus.test.tsx     — no autofocus
 *   - W625  / LobbyPage.test.tsx                        — aria-expanded toggle
 *
 * None of the above assert the absence of `aria-checked`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no aria-checked attribute (W2744)", () => {
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

  it("the drawer toggle button has no aria-checked attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The toggle is a disclosure control — `aria-expanded` already
    // communicates open/closed. `aria-checked` belongs to checkbox/
    // switch/radio semantics; on a plain BUTTON it is either silently
    // ignored or creates a duplicate, conflicting role-state
    // announcement alongside `aria-expanded`.
    expect(btn.hasAttribute("aria-checked")).toBe(false);
  });
});
