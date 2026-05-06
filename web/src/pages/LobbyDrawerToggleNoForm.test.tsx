import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2734 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry a `form` attribute. The toggle is a pure UI control that
 * flips local component state (drawer collapsed/expanded); it has no
 * relationship to any HTML <form> in the document. Adding `form="..."`
 * would associate the button with a form for submit-targeting purposes,
 * which is semantically wrong for a state-toggling control and could
 * cause unintended form submission if the form attribute pointed at any
 * (current or future) form id in the DOM.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
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
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid (and the default `aria-expanded="true"`).
 *
 * What none of those cover is the ABSENCE of a `form` attribute on the
 * toggle button itself. A regression that added (e.g.) `form="search-form"`
 * — perhaps to associate this button with a nearby search/filter form —
 * would (a) cause the button to be treated as a submit-target for that
 * form (depending on `type`), and (b) mis-represent the button's role
 * in the document semantics. Either change passes every existing
 * assertion above.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no form attribute (W2734)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W2387 / W1377 / W1134 /
    // W1265 / W1357 / W2312 sibling harnesses: widen jsdom's innerWidth
    // above the breakpoint AND stub matchMedia so the lobby's
    // `(min-width: 1024px)` query resolves "desktop" before render —
    // without this the drawer aside (and its toggle button) would not mount.
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

  it("the drawer toggle button has no form attribute (it is a UI state toggle, not a form control)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no `form` attribute on the toggle button.
    // The button toggles local React state via onClick; it must not be
    // associated with any <form> for submission targeting.
    expect(btn.hasAttribute("form")).toBe(false);
  });
});
