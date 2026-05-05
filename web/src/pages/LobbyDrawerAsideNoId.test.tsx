import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2023 — the desktop category drawer's outer `<aside>` element MUST
 * NOT carry an `id` attribute. The drawer aside is currently an
 * unidentified landmark: it's anchored externally by `data-testid`
 * (W1167) and named for AT via a direct `aria-label="Lobby
 * categories"`, with no fragment-link target, no `aria-labelledby`
 * pointer (W1934), and no skip-link relying on a known id.
 *
 * Sibling pins on this same `<aside>`:
 *   - W1167 / LobbyDrawerAside.test.tsx pins `tagName === "ASIDE"`
 *     and `aria-label === "Lobby categories"`.
 *   - LobbyDrawerAsideClass.test.tsx pins the EXACT `className` to
 *     `"lobby-drawer"` — adding an `id` would not violate that, but
 *     would still introduce a new external surface.
 *   - LobbyDrawerAsideNoRole.test.tsx (W1931) pins absence of `role`.
 *   - LobbyDrawerAsideAriaLabelledBy.test.tsx (W1934) pins absence of
 *     `aria-labelledby`.
 *
 * What none of those cover is the ABSENCE of an `id` attribute. A
 * future refactor that introduced e.g. `id="lobby-drawer"` would
 * silently:
 *   1. Create a stable URL fragment target (`/#lobby-drawer`) that
 *      external links and bookmarks could come to depend on, making
 *      it an undeclared part of the public contract.
 *   2. Enable `aria-labelledby` / `aria-controls` from elsewhere on
 *      the page to point at the drawer, coupling sibling components
 *      to an attribute this codebase has deliberately not advertised.
 *   3. Risk an id collision if the same identifier is reused on
 *      another page or inside the drawer's inner tree, which jsdom /
 *      browsers tolerate at render time but which breaks
 *      `getElementById` and fragment scrolling.
 *
 * One focused assertion: the outer drawer aside MUST NOT carry an
 * `id` attribute. If a future change deliberately needs one, that
 * change should add the new `id` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established pattern in this directory and avoid merge churn on the
 * mega-file.
 */
describe("LobbyPage — drawer aside has no id attribute (W2023)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1167 / W1931 /
    // W1934 siblings: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer
    // aside would not mount at all and the test would always fail
    // for the wrong reason.
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

  it("the outer drawer aside does NOT carry an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the stable testid — see W1167's note for why this is
    // the right anchor for assertions about the aside's attributes.
    const aside = screen.getByTestId("lobby-drawer");

    // Sanity: confirm we pinned the OUTER aside, same anchor as W1167.
    // Without this, a future restructure that renamed the testid onto
    // a non-aside wrapper could pass this assertion vacuously.
    expect(aside.tagName).toBe("ASIDE");

    // The actual contract: no `id` attribute on the outer drawer
    // aside. Use `hasAttribute` rather than checking for empty string
    // — an `id=""` would still be a (broken) public surface.
    expect(aside.hasAttribute("id")).toBe(false);
  });
});
