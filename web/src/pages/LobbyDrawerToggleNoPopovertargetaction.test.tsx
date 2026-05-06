import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2765 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry a `popovertargetaction` attribute. The HTML `popovertargetaction`
 * attribute is only meaningful on a button that ALSO carries
 * `popovertarget` (it tells the popover invoker whether a click should
 * "show", "hide", or "toggle" the referenced popover element). The
 * drawer toggle is a plain `type="button"` (pinned by W1357 /
 * LobbyDrawerToggleType.test.tsx) that flips local React state
 * (`drawerCollapsed`) — it does not invoke any popover and so must not
 * advertise any popover-action verb.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx around the drawer
 * toggle button render):
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
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx pins absence of `id`.
 *   - W2734 / LobbyDrawerToggleNoForm.test.tsx pins absence of `form`.
 *   - W2761 / LobbyDrawerToggleNoFormaction.test.tsx pins absence of
 *     `formaction`.
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid (and the default `aria-expanded="true"`).
 *
 * What none of those cover is the ABSENCE of a `popovertargetaction`
 * attribute on the toggle button itself. A regression that added (e.g.)
 * `popovertargetaction="toggle"` — perhaps via a copy-paste from a
 * popover-invoker button or an over-eager refactor that mistook the
 * collapsible drawer aside for a popover element — would advertise a
 * popover-verb on a button whose entire purpose is in-page React-state
 * mutation. Such a change passes every existing assertion above (type,
 * class, label, glyph, tabindex, id, form, formaction).
 *
 * Lives in a NEW SIBLING file to follow the established convention in
 * this directory (every distinct lobby attribute pin lives in its own
 * file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no popovertargetaction attribute (W2765)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W2761 / W2734 / W2387 /
    // W1377 / W1134 / W1265 / W1357 / W2312 sibling harnesses: widen
    // jsdom's innerWidth above the breakpoint AND stub matchMedia so
    // the lobby's `(min-width: 1024px)` query resolves "desktop" before
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

  it("the drawer toggle button has no popovertargetaction attribute (it is a React state toggle, not a popover invoker)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no `popovertargetaction` attribute on the
    // toggle button. `popovertargetaction` is only meaningful on
    // popover-invoker buttons (paired with `popovertarget`); this is a
    // stateful UI toggle (`type="button"`) and must not advertise any
    // popover show/hide/toggle verb.
    expect(btn.hasAttribute("popovertargetaction")).toBe(false);
  });
});
