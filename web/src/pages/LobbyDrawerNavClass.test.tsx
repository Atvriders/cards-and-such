import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1311 — the desktop category drawer's inner navigation element is
 * rendered as a `<nav>` element carrying the literal CSS hook
 * `className="lobby-drawer-nav"`. The drawer's stylesheet
 * (`web/src/pages/LobbyPage.css`) attaches the entire vertical
 * stacking layout, the gap between drawer rows, and the collapsed-rail
 * width transitions to this exact selector — without the class,
 * every row would collapse to a default flex layout and the drawer
 * would visibly disintegrate even though all of its semantic
 * attributes (role="tablist", aria-label, individual rows) would
 * still be intact.
 *
 * Existing sibling pins:
 *   - W1167 / LobbyDrawerAside.test.tsx pins the OUTER `<aside>`'s
 *     `aria-label="Lobby categories"` and `tagName === "ASIDE"`.
 *   - W1179 / LobbyDrawerOuterClass.test.tsx pins the wrapper's
 *     `lobby-page--drawer-collapsed` modifier toggle.
 *   - W1239 / LobbyDrawerSep.test.tsx pins the decorative separator
 *     `.lobby-drawer-sep` with aria-hidden="true".
 *   - LobbyPage.test.tsx pins the inner nav's
 *     `aria-label="Filter by category (drawer)"` accessible name and
 *     its `role="tablist"`.
 *
 * The inner nav's CSS hook (`className="lobby-drawer-nav"`) and its
 * concrete tagName (`NAV`) have never been pinned. A refactor that
 * lifted the class onto a different sibling (e.g. an inner div), or
 * that swapped the `<nav>` for a `<div role="tablist">`, would
 * silently break every CSS rule that targets `.lobby-drawer-nav`
 * without tripping any existing test. This file fills exactly that
 * gap with one focused assertion on the drawer aside's top-level
 * navigation child.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established convention in this directory.
 */
describe("LobbyPage — drawer inner nav element class+tagName (W1311)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1167 / W1179 / W1239
    // siblings: widen jsdom's innerWidth above the breakpoint AND stub
    // matchMedia so the lobby's `(min-width: 1024px)` query resolves
    // "desktop" before render — without this the drawer aside (and its
    // nav child) would never mount and the test would fail for the
    // wrong reason.
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

  it("the drawer aside's top-level nav child is a <nav class=\"lobby-drawer-nav\">", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the outer aside via the stable testid, then drill
    // into the single nav child. Querying via role="tablist" within
    // the aside disambiguates from the sibling chip-strip tablist
    // (which is NOT inside the drawer aside).
    const aside = screen.getByTestId("lobby-drawer");
    const nav = aside.querySelector('nav[role="tablist"]') as HTMLElement | null;
    expect(nav).not.toBeNull();
    if (!nav) return;

    // The element really must be a <nav> — a refactor to <div
    // role="tablist"> would still satisfy the role contract pinned
    // elsewhere but would lose the implicit landmark semantics.
    expect(nav.tagName).toBe("NAV");

    // The CSS hook class — pinned as an exact-match list-contains
    // (not a substring) so a stray `lobby-drawer-nav-foo` rename does
    // NOT accidentally satisfy this assertion.
    expect(nav.classList.contains("lobby-drawer-nav")).toBe(true);
  });
});
