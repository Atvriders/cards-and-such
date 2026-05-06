import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2738 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `autofocus` attribute. The lobby is the application's
 * landing surface and its initial focus belongs to the user — not to
 * a peripheral drawer chrome control. If `autofocus` were ever added
 * to the drawer toggle (perhaps as a misguided keyboard-accessibility
 * "improvement"), the page would steal focus on every mount, yanking
 * it away from the search input, the hero CTAs, and any link that
 * routed the user back to the lobby. Worse, screen-reader users would
 * land on "collapse drawer" / "expand drawer" announcements before
 * ever hearing the page heading or game grid — a deeply disorienting
 * first-contact moment.
 *
 * Existing sibling pins on the same toggle (LobbyPage.tsx ~line 1760)
 * deliberately do NOT cover this attribute:
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the swapping
 *     `aria-label` / `title` / glyph triple.
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx pins the inner
 *     `<span aria-hidden="true">` glyph child.
 *   - W1357 / LobbyDrawerToggleType.test.tsx pins `type="button"` and
 *     `tagName === "BUTTON"`.
 *   - W1377 / LobbyDrawerToggleClass.test.tsx pins the
 *     `className="lobby-drawer-toggle"` CSS hook (via classList).
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx pins absence of an
 *     explicit `tabindex` override.
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx pins absence of `id`.
 *   - W2431 / LobbyDrawerToggleNoAriaControls.test.tsx pins absence of
 *     an `aria-controls` linkage.
 *   - W2455 / LobbyDrawerToggleNoDisabled.test.tsx pins absence of
 *     `disabled`.
 *   - W2466-ish / LobbyDrawerToggleNoForm.test.tsx pins absence of
 *     `form`.
 *   - LobbyDrawerToggleNoName.test.tsx pins absence of `name`.
 *   - LobbyDrawerToggleNoAriaDisabled.test.tsx pins absence of
 *     `aria-disabled`.
 *
 * What none of those cover is the ABSENCE of the `autofocus`
 * attribute (HTML attribute) AND the corresponding DOM `autofocus`
 * IDL property being false. A regression that added
 * `autoFocus` (React's prop name) to the JSX for the toggle would
 * still pass every existing pin: the className, type, label, glyph,
 * tabindex-absence, id-absence, aria-controls-absence,
 * disabled-absence, form-absence, name-absence, and
 * aria-disabled-absence assertions all hold whether or not
 * `autofocus` is present. The lack of `autofocus` is therefore an
 * unwritten part of the toggle's contract — load-bearing for the
 * lobby's "user controls initial focus" UX promise — that has, until
 * now, been unwitnessed.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited
 * mega-files.
 */
describe("LobbyPage — drawer toggle button has no autofocus attribute (W2738)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the sibling W2455 /
    // W2387 / W2431 / W2312 / W1377 harnesses: widen jsdom's
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

  it("the drawer toggle button has no `autofocus` attribute (user-owns-initial-focus contract)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle") as HTMLButtonElement;
    // The actual contract: the lobby never auto-steals focus to the
    // drawer toggle on mount. Both the literal HTML attribute AND the
    // live DOM IDL property must be unset/false so a regression that
    // hard-codes `autofocus` (attribute) OR `autoFocus={true}` (React
    // boolean prop) is both caught.
    expect(btn.hasAttribute("autofocus")).toBe(false);
    expect(btn.autofocus).toBe(false);
  });
});
