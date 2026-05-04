import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1348 — every desktop drawer category row (`DrawerLink`) renders three
 * inner spans: a decorative glyph, a textual label, and a numeric count.
 * The glyph span MUST be `aria-hidden="true"` because the row's outer
 * `aria-label` already encodes the label + count ("All games — 4,500 games"),
 * so re-announcing the icon character (`◎`, `★`, `♥`, etc.) would produce
 * noisy, redundant SR output. This is the same pattern used by the chip
 * strip glyphs and the drawer toggle chevron.
 *
 * Existing sibling pins for the drawer:
 *   - W1167 / LobbyDrawerAside     — outer aside class + aria-label.
 *   - W1239 / LobbyDrawerSep       — decorative separator aria-hidden.
 *   - W1134 / LobbyDrawerToggleLabel — toggle aria-label / title / glyph.
 *   - W625 (LobbyPage.test.tsx)   — aria-selected / aria-current swap.
 *
 * What none of those pin: the glyph span INSIDE a drawer row. A refactor
 * that dropped `aria-hidden` from `.lobby-drawer-link-glyph` (or moved the
 * glyph into the same span as the label) would leak the icon character
 * into the row's accessible name and double-announce it on top of the
 * existing `aria-label`. This file pins exactly that observable contract
 * for the always-present "All games" row.
 */
describe("LobbyPage — drawer link glyph span (W1348)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the sibling tests:
    // widen jsdom's innerWidth above the breakpoint AND stub matchMedia
    // so the lobby's `(min-width: 1024px)` query resolves "desktop"
    // before render — without this the drawer aside (and its rows) would
    // never mount.
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

  it("renders the all-games drawer row glyph span with aria-hidden=\"true\" and the ◎ character", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the always-present "all" row — its testid is stable and
    // its glyph (◎) is hard-coded in the JSX, not derived from data.
    const row = screen.getByTestId("lobby-drawer-cat-all");
    const glyph = row.querySelector(".lobby-drawer-link-glyph");
    expect(glyph).not.toBeNull();

    // Decorative sentinel — must NOT be announced by AT. The row's outer
    // `aria-label` already says "All games — N games"; re-announcing
    // "◎" on top of that would be noise. Pinning the literal "true"
    // (not the boolean) matches the JSX exactly.
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
    // The glyph character itself is the visual identity of the row —
    // a refactor that swapped it (or emptied the span) would silently
    // shift the icon column.
    expect(glyph!.textContent).toBe("◎");
  });
});
