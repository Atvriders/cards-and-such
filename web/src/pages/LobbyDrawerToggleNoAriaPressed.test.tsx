import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2740 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-pressed` attribute. The toggle is a disclosure
 * control, NOT a two-state toggle button: its open/closed state is
 * communicated entirely via `aria-expanded` (pinned by W625 in
 * LobbyPage.test.tsx through the click->data-collapsed contract).
 *
 * `aria-pressed` would be appropriate ONLY for a true toggle button
 * (e.g. the favorites/density chips that pin one of N choices). Using
 * both `aria-expanded` AND `aria-pressed` on the same control is an
 * ARIA antipattern — assistive tech would announce two competing role
 * states ("expanded/collapsed" vs. "pressed/not pressed") for the same
 * underlying boolean, which is precisely the confusion the WAI-ARIA
 * Authoring Practices warn against.
 *
 * Pinning `aria-pressed` absence here closes the loop: a future
 * change that pre-emptively added `aria-pressed={!drawerCollapsed}`
 * to "mirror" `aria-expanded` would be a regression — every existing
 * sibling pin (label/title/glyph/type/class/tabindex/id/aria-controls
 * /aria-disabled/disabled/form/name) would still pass.
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
 *   - W???? / LobbyDrawerToggleNoDisabled.test.tsx      — no disabled
 *   - W???? / LobbyDrawerToggleNoForm.test.tsx          — no form
 *   - W???? / LobbyDrawerToggleNoName.test.tsx          — no name
 *   - W625  / LobbyPage.test.tsx                        — aria-expanded toggle
 *
 * None of the above assert the absence of `aria-pressed`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no aria-pressed attribute (W2740)", () => {
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

  it("the drawer toggle button has no aria-pressed attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The toggle is a disclosure control — `aria-expanded` already
    // communicates open/closed. Adding `aria-pressed` would create a
    // duplicate, conflicting role-state announcement (ARIA
    // antipattern: "expanded" vs. "pressed" for the same boolean).
    expect(btn.hasAttribute("aria-pressed")).toBe(false);
  });
});
