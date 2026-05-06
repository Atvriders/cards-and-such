import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2736 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry a `value` attribute. The `value` attribute on a `<button>` is
 * only meaningful inside a `<form>` (it becomes the data submitted
 * for that button when it acts as the form's submitter, paired with
 * its `name`). Outside any form, `value` is dead weight: it adds an
 * inert addressing surface, leaks an opaque string into the DOM that
 * downstream code (or accessibility scanners that fall back to
 * reading button `value`) might latch onto, and silently invites
 * regressions where someone wires the toggle into a real `<form>`
 * and discovers the button has been quietly submitting a stale
 * value all along.
 *
 * The toggle lives outside any `<form>` (see LobbyPage.tsx ~line
 * 1758: it sits inside the drawer `<aside>` whose only descendants
 * are the toggle button, a `<nav>`, and the link `<ul>`). Its
 * canonical addressing hooks are the stable
 * `data-testid="lobby-drawer-toggle"` (used by tests) and the
 * `className="lobby-drawer-toggle"` CSS hook (used by styles); its
 * accessible name comes from the swapping `aria-label` (W1134).
 * A regression that added `value="toggle"` — perhaps copy-pasted
 * from a real form button elsewhere, or as part of a future plan
 * to wire the drawer state into a hidden form — would silently
 * introduce that latent surface and pass every other existing
 * assertion on the toggle.
 *
 * Existing sibling pins on the toggle (LobbyPage.tsx ~line 1758):
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the swapping
 *     `aria-label` / `title` / glyph triple.
 *   - W1265 / LobbyDrawerToggleGlyphHidden.test.tsx pins the inner
 *     `<span aria-hidden="true">` glyph child.
 *   - W1357 / LobbyDrawerToggleType.test.tsx pins `type="button"` and
 *     `tagName === "BUTTON"`.
 *   - W1377 / LobbyDrawerToggleClass.test.tsx pins the
 *     `className="lobby-drawer-toggle"` CSS hook.
 *   - W2312 / LobbyDrawerToggleNoTabindex.test.tsx pins absence of
 *     an explicit `tabindex` override.
 *   - W2387 / LobbyDrawerToggleNoId.test.tsx pins absence of an `id`.
 *   - W2732 / LobbyDrawerToggleNoName.test.tsx pins absence of a
 *     `name` attribute (the sibling form-control surface).
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no value attribute (W2736)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W2732 / W2387 / W1377 /
    // W1134 / W1265 / W1357 / W2312 sibling harnesses: widen jsdom's
    // innerWidth above the breakpoint AND stub matchMedia so the lobby's
    // `(min-width: 1024px)` query resolves "desktop" before render —
    // without this the drawer aside (and its toggle button) would not
    // mount.
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

  it("the drawer toggle button has no value attribute (it's not a form control)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no `value` on the toggle button. The button
    // lives outside any `<form>`, so `value` would be inert at best and
    // misleading at worst — the testid+className already provide the
    // canonical addressing hooks, and `aria-label` provides the
    // accessible name. This pin complements W2732 (no `name`): without
    // both, a regression that added either half of the form-submission
    // pair would silently land.
    expect(btn.hasAttribute("value")).toBe(false);
  });
});
