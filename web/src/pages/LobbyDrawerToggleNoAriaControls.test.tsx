import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2431 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `aria-controls` attribute in its current shape. The toggle
 * lives INSIDE the same `<aside class="lobby-drawer">` it controls, so
 * the button's collapse/expand state is conveyed entirely via:
 *   - `aria-expanded` on the button itself (pinned by W625 in
 *     LobbyPage.test.tsx via the click->data-collapsed contract), and
 *   - `data-collapsed` on the parent aside (pinned by W625).
 *
 * `aria-controls` would be appropriate ONLY if the toggle controlled a
 * disjoint region addressed by `id`; right now neither the aside nor
 * the inner `<nav class="lobby-drawer-nav">` carry an `id` (W2387 pins
 * the toggle's own `id` absence and explicitly notes that adding one
 * "to wire up an `aria-controls` reference" would be a regression).
 * Pinning `aria-controls` absence here closes the loop: a future change
 * that pre-emptively added a dangling `aria-controls="drawer"` (with no
 * matching `id="drawer"` element in the DOM) would break the AT
 * contract by promising a target that does not exist — every existing
 * sibling pin would still pass.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx       — aria-label/title/glyph
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx — inner span aria-hidden
 *   - W1357 / LobbyDrawerToggleType.test.tsx        — type="button" + BUTTON tag
 *   - W1377 / LobbyDrawerToggleClass.test.tsx       — className CSS hook
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx  — no explicit tabindex
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx        — no id attribute
 *   - W625  / LobbyPage.test.tsx                    — aria-expanded toggle
 *
 * None of the above assert the absence of `aria-controls`. This file
 * follows the directory's "one attribute per file" convention.
 */
describe("LobbyPage — drawer toggle has no aria-controls attribute (W2431)", () => {
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

  it("the drawer toggle button has no aria-controls attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The toggle is INSIDE the region it controls; `aria-expanded`
    // alone communicates the collapsed/expanded state. A dangling
    // `aria-controls` (with no matching `id` target in the DOM, since
    // neither the aside nor the inner nav carry one) would mislead AT.
    expect(btn.hasAttribute("aria-controls")).toBe(false);
  });
});
