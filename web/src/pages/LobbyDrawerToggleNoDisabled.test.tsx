import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2455 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry a `disabled` attribute. The toggle is the user's only handle
 * for the lobby drawer's collapsed/expanded contract — disabling it
 * (even momentarily, e.g. during a hypothetical "loading" gate) would
 * trap users in whichever drawer state they happened to be in, since
 * there is no other UI affordance that flips `data-collapsed` on the
 * surrounding `<aside data-testid="lobby-drawer">`. The button is
 * always interactive on desktop and that contract is what every
 * sibling test on the toggle implicitly relies on.
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
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx pins absence of an `id`.
 *   - W2431 / LobbyDrawerToggleNoAriaControls.test.tsx pins absence of
 *     an `aria-controls` linkage.
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid (and the `aria-expanded` flip).
 *
 * What none of those cover is the ABSENCE of a `disabled` attribute on
 * the toggle button itself. A regression that added (e.g.)
 * `disabled={loadingPrefs}` — perhaps to gate the toggle while async
 * preferences hydrate — would silently wedge keyboard and pointer
 * users out of the drawer collapse contract entirely, while still
 * passing every existing pin on the button (the className, type,
 * label, glyph, id-absence, tabindex-absence, aria-controls-absence,
 * and aria-expanded assertions all hold whether or not `disabled` is
 * present). The lack of `disabled` is therefore an unwritten part of
 * the contract that has, until now, been load-bearing-but-unwitnessed.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no disabled attribute (W2455)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the sibling W2387 /
    // W2431 / W2312 / W1377 harnesses: widen jsdom's innerWidth above
    // the breakpoint AND stub matchMedia so the lobby's
    // `(min-width: 1024px)` query resolves "desktop" before render —
    // without this the drawer aside (and its toggle button) would
    // not mount.
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

  it("the drawer toggle button has no `disabled` attribute (always-interactive contract)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle") as HTMLButtonElement;
    // The actual contract: the toggle is always enabled on desktop so
    // the user can always flip the drawer between collapsed and
    // expanded. Both the literal HTML attribute AND the live DOM
    // property must be unset/false so a regression that hard-codes
    // `disabled` (attribute) OR `disabled={true}` (boolean prop) is
    // both caught.
    expect(btn.hasAttribute("disabled")).toBe(false);
    expect(btn.disabled).toBe(false);
  });
});
