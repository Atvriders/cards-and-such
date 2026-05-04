import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1453 — the desktop drawer collapse/expand toggle's inner chevron
 * `<span aria-hidden="true">` is a LEAF element: it carries no element
 * children, only the literal chevron text node (`‹` or `›`). Pinning
 * `childElementCount === 0` guards against a regression that wraps
 * the chevron in an additional element (e.g. an `<i class="icon">…</i>`
 * sub-wrapper or a state-driven `<span class="active">…</span>` slot)
 * which would silently break two contracts at once:
 *
 *   1. The W1265 (LobbyDrawerToggleGlyphHidden.test.tsx) pin already
 *      asserts `firstElementChild.tagName === "SPAN"` and its
 *      `textContent`, but a nested element with the same chevron text
 *      would still satisfy that pin while changing the AT tree shape
 *      (every nested element creates an extra "generic" landmark in
 *      AccName traversal even with `aria-hidden="true"` inherited).
 *   2. CSS rules that target `.lobby-drawer-toggle > span` directly
 *      (sizing, transform-origin for the chevron flip animation)
 *      would silently miss a deeper wrapper, leaving the chevron
 *      visually mis-aligned without any test failure.
 *
 * W1265 / LobbyDrawerToggleGlyphHidden.test.tsx pins the wrapper
 * span's `aria-hidden="true"` and chevron textContent. W1134 /
 * LobbyDrawerToggleLabel.test.tsx pins the swapping aria-label /
 * title / glyph textContent triple. W1357 /
 * LobbyDrawerToggleType.test.tsx pins `type="button"` on the toggle.
 * None assert that the inner span is structurally a LEAF — a regression
 * that introduced a nested wrapper would slip past every existing pin.
 * This file fills exactly that gap on a distinct structural contract.
 *
 * Lives in a NEW SIBLING file (not LobbyDrawerToggleGlyphHidden.test.tsx
 * or LobbyPage.test.tsx) because both are concurrently edited by many
 * agents — adding here avoids merge churn while pinning a separate
 * structural invariant on the inner glyph span.
 */
describe("LobbyPage — drawer toggle inner glyph span is a leaf (W1453)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1265 / W1357
    // sibling harnesses: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer aside
    // (and its toggle button, and the inner glyph span) would not mount.
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

  it("the chevron glyph span has no element children (childElementCount === 0)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const toggle = screen.getByTestId("lobby-drawer-toggle");
    const glyphSpan = toggle.firstElementChild;
    // Sanity: confirm we resolved the inner span before asserting on
    // its structural shape — this overlaps with W1265 by design (the
    // pin would be meaningless against a null node) but the assertion
    // below is on a fresh contract not covered there.
    expect(glyphSpan).not.toBeNull();
    expect(glyphSpan!.tagName).toBe("SPAN");
    // The chevron span MUST be a leaf element: zero element children.
    // The literal `‹` / `›` lives as a TEXT node directly on the span,
    // not under a nested wrapper. A regression that introduced any
    // nested element (icon component, animation slot, etc.) would
    // bump this count to 1+ and fail the pin immediately.
    expect(glyphSpan!.childElementCount).toBe(0);
  });
});
