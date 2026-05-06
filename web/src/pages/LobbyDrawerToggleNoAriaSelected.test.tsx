import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2742 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-selected` attribute. `aria-selected` is only valid on
 * elements with selectable roles (option, tab, row, gridcell, etc.).
 * The drawer toggle is a plain `<button type="button">` whose state is
 * conveyed via:
 *   - `aria-expanded` on the button itself (pinned by W625 in
 *     LobbyPage.test.tsx via the click->data-collapsed contract), and
 *   - `data-collapsed` on the parent aside (pinned by W625).
 *
 * Adding `aria-selected` would be an ARIA contract violation: the
 * implicit `role="button"` does not support it, and AT would either
 * ignore it or, worse, mis-classify the toggle as part of a
 * selection group (tablist/listbox). Pinning its absence here closes
 * the loop alongside the other "no spurious ARIA" sibling pins.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx          — aria-label/title/glyph
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx    — inner span aria-hidden
 *   - W1357 / LobbyDrawerToggleType.test.tsx           — type="button" + BUTTON tag
 *   - W1377 / LobbyDrawerToggleClass.test.tsx          — className CSS hook
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx     — no explicit tabindex
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx           — no id attribute
 *   - W2431 / LobbyDrawerToggleNoAriaControls.test.tsx — no aria-controls
 *   - W625  / LobbyPage.test.tsx                       — aria-expanded toggle
 *
 * None of the above assert the absence of `aria-selected`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no aria-selected attribute (W2742)", () => {
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

  it("the drawer toggle button has no aria-selected attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The implicit `role="button"` does not support aria-selected;
    // collapsed/expanded state is conveyed via aria-expanded (W625).
    expect(btn.hasAttribute("aria-selected")).toBe(false);
  });
});
