import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2777 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-modal` attribute. The toggle is an inline disclosure
 * control (a plain BUTTON) inside the lobby chrome; it is NOT a
 * dialog/alertdialog wrapper and it does NOT trap focus. Its
 * open/closed state is communicated entirely via `aria-expanded`
 * (pinned by W625 in LobbyPage.test.tsx via the click->data-collapsed
 * contract) and its sibling drawer aside is a `<nav>` landmark, not
 * a modal surface.
 *
 * Per the WAI-ARIA 1.2 spec, `aria-modal` is only meaningful on
 * elements with role `dialog` or `alertdialog`; its presence on any
 * other element is undefined behavior. On a plain BUTTON disclosure
 * control, `aria-modal` would either be silently ignored by AT
 * (silent contract drift) or — worse, on UAs that interpret it
 * loosely — cause AT to suppress everything outside the button as
 * "inert background", breaking the entire lobby's keyboard and
 * screen-reader navigation. The drawer is a sidebar, not a modal:
 * the rest of the page must remain reachable while it is open.
 *
 * Pinning `aria-modal` absence here closes a distinct gap: the
 * sibling LobbyFamPickerAriaModal.test.tsx pins `aria-modal="true"`
 * on the family-picker dialog (correct usage on role="dialog"), and
 * the existing toggle pins below cover every other ARIA-state
 * attribute except `aria-modal`. A future change that pre-emptively
 * added `aria-modal={!drawerCollapsed}` to "mark" the open drawer,
 * or that promoted the toggle's parent to role="dialog" with the
 * attribute attached to the wrong element, would be a regression —
 * every existing sibling pin (label/title/glyph/type/class/tabindex
 * /id/aria-controls/aria-disabled/aria-pressed/aria-selected
 * /aria-checked/aria-current/aria-haspopup/disabled/form/name/value
 * /autofocus/formaction/popovertarget/popovertargetaction) would
 * still pass.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx                 — aria-label/title/glyph
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx           — inner span aria-hidden
 *   - W1357 / LobbyDrawerToggleType.test.tsx                  — type="button" + BUTTON tag
 *   - W1377 / LobbyDrawerToggleClass.test.tsx                 — className CSS hook
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx            — no explicit tabindex
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx                  — no id attribute
 *   - W2431 / LobbyDrawerToggleNoAriaControls.test.tsx        — no aria-controls
 *   - W???? / LobbyDrawerToggleNoAriaDisabled.test.tsx        — no aria-disabled
 *   - W2740 / LobbyDrawerToggleNoAriaPressed.test.tsx         — no aria-pressed
 *   - W2744 / LobbyDrawerToggleNoAriaChecked.test.tsx         — no aria-checked
 *   - W???? / LobbyDrawerToggleNoAriaSelected.test.tsx        — no aria-selected
 *   - W???? / LobbyDrawerToggleNoAriaCurrent.test.tsx         — no aria-current
 *   - W???? / LobbyDrawerToggleNoAriaHaspopup.test.tsx        — no aria-haspopup
 *   - W???? / LobbyDrawerToggleNoDisabled.test.tsx            — no disabled
 *   - W???? / LobbyDrawerToggleNoForm.test.tsx                — no form
 *   - W???? / LobbyDrawerToggleNoName.test.tsx                — no name
 *   - W???? / LobbyDrawerToggleNoValue.test.tsx               — no value
 *   - W???? / LobbyDrawerToggleNoAutofocus.test.tsx           — no autofocus
 *   - W???? / LobbyDrawerToggleNoFormaction.test.tsx          — no formaction
 *   - W???? / LobbyDrawerToggleNoPopovertarget.test.tsx       — no popovertarget
 *   - W???? / LobbyDrawerToggleNoPopovertargetaction.test.tsx — no popovertargetaction
 *   - W625  / LobbyPage.test.tsx                              — aria-expanded toggle
 *
 * None of the above assert the absence of `aria-modal`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no aria-modal attribute (W2777)", () => {
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

  it("the drawer toggle button has no aria-modal attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The toggle is an inline disclosure control, not a dialog
    // surface. `aria-modal` is only meaningful on role="dialog" /
    // "alertdialog"; its presence on a plain BUTTON is either
    // silently ignored or, on loose UAs, suppresses surrounding
    // content as inert background — breaking the rest of the lobby.
    expect(btn.hasAttribute("aria-modal")).toBe(false);
  });
});
