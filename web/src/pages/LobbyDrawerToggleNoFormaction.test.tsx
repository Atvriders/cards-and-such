import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2761 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry a `formaction` attribute. The `formaction` attribute is only
 * meaningful on `<button type="submit">` (or `<input type="submit">`)
 * inside a form, where it overrides the form's `action` for that
 * particular submit. The drawer toggle is `type="button"` (pinned by
 * W1357 / LobbyDrawerToggleType.test.tsx) and exists purely to flip
 * local React state (drawer collapsed/expanded) — it must not advertise
 * any form-submission URL override.
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
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid (and the default `aria-expanded="true"`).
 *
 * What none of those cover is the ABSENCE of a `formaction` attribute
 * on the toggle button itself. A regression that added (e.g.)
 * `formaction="/api/drawer/toggle"` — perhaps via a copy-paste from a
 * submit button or an over-eager refactor that conflated the toggle
 * with a server-driven control — would advertise a submit-override
 * URL on a button whose entire purpose is in-page state mutation.
 * Such a change passes every existing assertion above (type, class,
 * label, glyph, tabindex, id, form).
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no formaction attribute (W2761)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W2734 / W2387 / W1377 /
    // W1134 / W1265 / W1357 / W2312 sibling harnesses: widen jsdom's
    // innerWidth above the breakpoint AND stub matchMedia so the
    // lobby's `(min-width: 1024px)` query resolves "desktop" before
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

  it("the drawer toggle button has no formaction attribute (it is a UI state toggle, not a submit override)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no `formaction` attribute on the toggle
    // button. `formaction` is only meaningful for submit buttons; this
    // is a stateful UI toggle (`type="button"`) and must not advertise
    // any form-submission URL override.
    expect(btn.hasAttribute("formaction")).toBe(false);
  });
});
