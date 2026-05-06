import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2807 — the desktop drawer collapse/expand toggle button MUST NOT
 * carry an `inputmode` attribute. The `inputmode` global attribute is
 * a hint to browsers about which virtual keyboard layout to display
 * when an editable element is focused (e.g. `numeric`, `tel`, `email`,
 * `decimal`, `url`, `search`). It is meaningful for editing controls
 * (`<input>`, `<textarea>`, `contenteditable` hosts), NOT for a plain
 * `<button>` that flips local component state.
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
 *   - W2734 / LobbyDrawerToggleNoForm.test.tsx pins absence of `form`.
 *   - W2... / LobbyDrawerToggleNoValue.test.tsx pins absence of `value`.
 *   - W625  / LobbyPage.test.tsx exercises the click->data-collapsed
 *     contract via the testid (and the default `aria-expanded="true"`).
 *
 * What none of those cover is the ABSENCE of an `inputmode` attribute
 * on the toggle button itself. A regression that added (e.g.)
 * `inputmode="none"` or `inputmode="numeric"` — perhaps copy-pasted
 * from a nearby search/filter <input> — would be (a) semantically
 * meaningless on a non-editable <button>, and (b) potentially
 * confusing to assistive tech and to future maintainers reading the
 * markup. Either change passes every existing assertion above.
 *
 * Lives in a NEW SIBLING file to follow the established convention
 * in this directory (every distinct lobby attribute pin lives in its
 * own file) and to avoid merge churn on concurrently-edited mega-files.
 */
describe("LobbyPage — drawer toggle button has no inputmode attribute (W2807)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W2387 / W1377 / W1134 /
    // W1265 / W1357 / W2312 / W2734 sibling harnesses: widen jsdom's
    // innerWidth above the breakpoint AND stub matchMedia so the lobby's
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

  it("the drawer toggle button has no inputmode attribute (it is a non-editable UI control)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-drawer-toggle");
    // The actual contract: no `inputmode` attribute on the toggle button.
    // `inputmode` is a virtual-keyboard hint for editable elements; it has
    // no defined behavior on a plain <button> and must not appear here.
    expect(btn.hasAttribute("inputmode")).toBe(false);
  });
});
