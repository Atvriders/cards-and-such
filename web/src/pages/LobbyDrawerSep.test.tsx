import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1239 — the desktop category drawer's nav contains a decorative
 * separator `<div className="lobby-drawer-sep" aria-hidden="true" />`
 * that visually divides the categorical filters (all + CATEGORY_ORDER)
 * from the personalised filters (favorites / top-rated / recently-played).
 *
 * The separator is purely visual: it has no text, no role, and MUST be
 * `aria-hidden="true"` so AT users walking the tablist with arrow keys
 * don't have a non-tab DOM child of role="tablist" announced or counted
 * in the tab set. WAI-ARIA explicitly forbids non-tab children of a
 * tablist from participating in navigation; marking the separator
 * `aria-hidden` is the established escape hatch.
 *
 * Existing sibling pins:
 *   - W1167 / LobbyDrawerAside.test.tsx pins the outer aside aria-label.
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the toggle label/title.
 *   - W1150 / LobbyChipStripAria.test.tsx pins the chip-strip tablist
 *     aria-label.
 *
 * The drawer separator's `aria-hidden` and class hook have never been
 * pinned — a refactor that dropped the attribute (or relied on a
 * `role="separator"` instead, which would still announce as a "separator"
 * stop) would silently regress drawer keyboard navigation without
 * breaking any current test. This file fills exactly that gap.
 */
describe("LobbyPage — drawer decorative separator (W1239)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the sibling tests:
    // widen jsdom's innerWidth above the breakpoint AND stub matchMedia
    // so the lobby's `(min-width: 1024px)` query resolves "desktop"
    // before render — without this the drawer aside (and its nav, and
    // hence the separator) would never mount.
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

  it("renders a .lobby-drawer-sep child with aria-hidden=\"true\" inside the drawer nav", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the outer aside (stable testid), then drill into the
    // nav (role=tablist) to scope the query — there is exactly one
    // separator and it MUST live inside the tablist for the visual
    // ordering and keyboard contract to make sense.
    const aside = screen.getByTestId("lobby-drawer");
    const nav = aside.querySelector('nav[role="tablist"]');
    expect(nav).not.toBeNull();

    const sep = nav!.querySelector(".lobby-drawer-sep");
    expect(sep).not.toBeNull();
    // Decorative sentinel — must NOT be announced by AT and must NOT
    // carry an interactive role. Pinning aria-hidden="true" (string,
    // not boolean) matches the JSX literal exactly.
    expect(sep!.getAttribute("aria-hidden")).toBe("true");
    // No text content — a regression that accidentally rendered a
    // label like "More" inside the separator would still be hidden by
    // aria-hidden, but would visually break the divider.
    expect(sep!.textContent ?? "").toBe("");
  });
});
