import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1917 — the desktop category drawer's outer wrapper element is
 * rendered as `<aside class="lobby-drawer">` with EXACTLY that single
 * class string and nothing else. The drawer's stylesheet
 * (`web/src/pages/LobbyPage.css`) hangs the entire fixed-rail layout,
 * the desktop-only positioning, the resize-handle anchor, and the
 * collapsed/expanded width transitions off the bare `.lobby-drawer`
 * selector. Without the class — or with an extra incidental class
 * tacked on like `"lobby-drawer is-foo"` — every CSS rule that targets
 * `.lobby-drawer { ... }` directly would still apply, but rules like
 * `.lobby-page:not(.lobby-page--drawer-collapsed) .lobby-drawer` and
 * combinators that depend on a clean class list would silently regress
 * in subtle ways that no behavioural test would catch.
 *
 * Existing sibling pins on the same drawer aside:
 *   - W1167 / LobbyDrawerAside.test.tsx pins the OUTER aside's
 *     `aria-label="Lobby categories"` and `tagName === "ASIDE"` —
 *     it does NOT assert className equality.
 *   - W1179 / LobbyDrawerOuterClass.test.tsx pins the WRAPPER
 *     `.lobby-page` element's `lobby-page--drawer-collapsed`
 *     modifier — a different element entirely.
 *   - W1311 / LobbyDrawerNavClass.test.tsx pins the INNER `<nav>`
 *     child's `lobby-drawer-nav` class — also a different element.
 *
 * The OUTER aside's exact `className` string has never been pinned.
 * A refactor that appended an extra class for any reason
 * (`"lobby-drawer lobby-drawer--rail"`, `"lobby-drawer is-mounted"`,
 * etc.) would silently invalidate every external selector that
 * assumed a single-class element without breaking any current test.
 * This file fills exactly that gap with one focused exact-equality
 * assertion.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established convention in this directory.
 */
describe("LobbyPage — drawer aside exact className (W1917)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1167 / W1179 / W1311
    // siblings: widen jsdom's innerWidth above the breakpoint AND stub
    // matchMedia so the lobby's `(min-width: 1024px)` query resolves
    // "desktop" before render — without this the drawer aside would
    // not mount and the test would fail for the wrong reason.
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

  it("the drawer aside renders with className exactly equal to \"lobby-drawer\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the stable testid rather than a tag/role query — the
    // testid is independently pinned by W1167, so this test will not
    // double-fault if a totally unrelated regression breaks the testid.
    const aside = screen.getByTestId("lobby-drawer");

    // Sanity: confirm we really did locate the OUTER aside element
    // before asserting on its className. Without this guard a future
    // testid migration onto an inner element could make the className
    // assertion below silently match a different element's empty
    // class string.
    expect(aside.tagName).toBe("ASIDE");

    // EXACT-EQUALITY pin (not a `classList.contains` check) — the
    // whole point of W1917 is to forbid extra incidental classes
    // creeping onto this element. `classList.contains` would silently
    // accept `"lobby-drawer lobby-drawer--rail"`; `===` will not.
    expect(aside.className).toBe("lobby-drawer");
  });
});
