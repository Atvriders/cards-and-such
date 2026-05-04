import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1357 — the desktop drawer collapse/expand toggle button carries an
 * explicit `type="button"` attribute. Inside a `<form>` ancestor a
 * `<button>` element defaults to `type="submit"`, which means a stray
 * Enter keypress (or implicit submission) anywhere in the page tree
 * could fire the toggle as a form submit, navigating the page away
 * and discarding all unsaved lobby state (filter, sort, search query).
 *
 * The toggle is rendered unconditionally on desktop and lives high up
 * in the page tree — there is no current `<form>` ancestor, but the
 * defensive `type="button"` is the contract that protects against any
 * future wrapping (e.g. a search-form refactor that hoists the lobby
 * inside a form). LobbyPagerPrevType.test.tsx (W… ) pins the same
 * contract for the prev-pager button; this file pins it for the
 * drawer toggle, which is a separate render site.
 *
 * W1134 / LobbyDrawerToggleLabel.test.tsx pins the toggle's swapping
 * `aria-label` / `title` / glyph triple. W1265 /
 * LobbyDrawerToggleGlyphHidden.test.tsx pins the inner span's
 * `aria-hidden`. Neither asserts `type="button"` — a regression that
 * dropped the attribute would slip past both. This file fills exactly
 * that gap on a separate DOM contract.
 *
 * Lives in a NEW SIBLING file (not LobbyDrawerToggleLabel.test.tsx or
 * LobbyPage.test.tsx) because both are concurrently edited by many
 * agents — adding here avoids merge churn while pinning a distinct
 * defensive-default contract.
 */
describe("LobbyPage — drawer toggle explicit type=button (W1357)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1134 / W1265
    // sibling harnesses: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer aside
    // (and its toggle button) would not mount.
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

  it("the drawer toggle button has explicit type=\"button\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const toggle = screen.getByTestId("lobby-drawer-toggle");
    // Confirm we resolved the actual <button> element (not a wrapping
    // div with the testid) before asserting on the type attribute —
    // the `type` semantic only applies to <button>, <input>, etc.
    expect(toggle.tagName).toBe("BUTTON");
    // The toggle MUST opt in to `type="button"` rather than rely on
    // the default. `toHaveAttribute` checks the literal DOM attribute
    // (not the IDL property), which is what guards against an absent
    // attribute defaulting to "submit" inside a future form ancestor.
    expect(toggle).toHaveAttribute("type", "button");
  });
});
