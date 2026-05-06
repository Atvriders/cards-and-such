import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2748 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-haspopup` attribute. The toggle is a disclosure
 * control whose only job is to collapse/expand an in-flow `<aside>`
 * sibling — it does NOT open a popup (menu, listbox, tree, grid,
 * dialog). Open/closed state is communicated entirely via
 * `aria-expanded` (pinned by W625 in LobbyPage.test.tsx through the
 * click->data-collapsed contract).
 *
 * `aria-haspopup` is appropriate ONLY when activating the control
 * displays a transient popup (per the ARIA 1.2 spec, valid tokens are
 * "menu", "listbox", "tree", "grid", "dialog", "true"/"false"). The
 * drawer-toggle does none of those — annotating it would mislead
 * assistive tech into announcing a non-existent popup affordance, and
 * users would expect arrow-key navigation into a popup that never
 * appears.
 *
 * Pinning `aria-haspopup` absence here closes the loop: a future
 * change that pre-emptively added `aria-haspopup="true"` (or e.g.
 * `aria-haspopup="menu"` mistaking the drawer for a popover) would
 * be a regression — every existing sibling pin (label/title/glyph/
 * type/class/tabindex/id/aria-controls/aria-disabled/aria-pressed
 * /aria-checked/aria-selected/disabled/form/name/value/autofocus)
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
 *   - W2740 / LobbyDrawerToggleNoAriaPressed.test.tsx   — no aria-pressed
 *   - W???? / LobbyDrawerToggleNoAriaChecked.test.tsx   — no aria-checked
 *   - W???? / LobbyDrawerToggleNoAriaSelected.test.tsx  — no aria-selected
 *   - W???? / LobbyDrawerToggleNoAriaDisabled.test.tsx  — no aria-disabled
 *   - W???? / LobbyDrawerToggleNoDisabled.test.tsx      — no disabled
 *   - W???? / LobbyDrawerToggleNoForm.test.tsx          — no form
 *   - W???? / LobbyDrawerToggleNoName.test.tsx          — no name
 *   - W???? / LobbyDrawerToggleNoValue.test.tsx         — no value
 *   - W???? / LobbyDrawerToggleNoAutofocus.test.tsx     — no autofocus
 *   - W625  / LobbyPage.test.tsx                        — aria-expanded toggle
 *
 * None of the above assert the absence of `aria-haspopup`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no aria-haspopup attribute (W2748)", () => {
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

  it("the drawer toggle button has no aria-haspopup attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The toggle is a disclosure control — it collapses/expands an
    // in-flow sibling, NOT a popup. `aria-haspopup` would mislead
    // assistive tech into announcing a non-existent popup affordance.
    expect(btn.hasAttribute("aria-haspopup")).toBe(false);
  });
});
