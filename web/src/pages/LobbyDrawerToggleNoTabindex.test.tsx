import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2312 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an explicit `tabindex` attribute. As a native `<button>` it
 * already participates in the natural tab order (sequential focus
 * navigation) for free; adding `tabIndex={0}` would be redundant
 * noise, while `tabIndex={-1}` would silently remove the toggle from
 * the keyboard tab sequence — making the drawer collapse/expand
 * affordance unreachable for keyboard-only users.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the swapping
 *     `aria-label` / `title` / glyph triple (and `aria-expanded`).
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx pins the inner
 *     `<span aria-hidden="true">` glyph child.
 *   - W1357 / LobbyDrawerToggleType.test.tsx pins `type="button"` and
 *     `tagName === "BUTTON"`.
 *   - W1377 / LobbyDrawerToggleClass.test.tsx pins the
 *     `className="lobby-drawer-toggle"` CSS hook.
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the toggle button itself. A regression that added `tabIndex={-1}`
 * (e.g. to suppress focus during a drawer animation) would silently
 * strip the toggle from the keyboard tab sequence; one that added
 * `tabIndex={0}` would be a redundant override that masks any future
 * intent to opt the toggle out of the natural order. Either change
 * passes every existing assertion above.
 *
 * Note: a sibling test (W2192 / LobbyDrawerAsideNoTabIndex.test.tsx)
 * pins the same contract for the OUTER `<aside>` drawer landmark.
 * This file pins it for the toggle BUTTON specifically — a separate
 * DOM node with a separate contract.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory and avoid merge churn on concurrently-edited
 * mega-files.
 */
describe("LobbyPage — drawer toggle button has no explicit tabindex attribute (W2312)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1377 / W1134 / W1265
    // / W1357 sibling harnesses: widen jsdom's innerWidth above the
    // breakpoint AND stub matchMedia so the lobby's `(min-width: 1024px)`
    // query resolves "desktop" before render — without this the drawer
    // aside (and its toggle button) would not mount.
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

  it("the drawer toggle button has no explicit tabindex attribute (relies on native button focusability)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no explicit tabindex override on the
    // toggle button. Native <button> is focusable by default; any
    // explicit value (0 or -1) would either be redundant or silently
    // pull the toggle out of the keyboard tab sequence.
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});
