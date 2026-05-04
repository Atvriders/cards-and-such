import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1265 — the desktop drawer collapse/expand toggle button wraps its
 * chevron glyph (`‹` / `›`) in a `<span aria-hidden="true">…</span>`.
 * The hidden-from-AT contract on that inner span is what makes the
 * `aria-label` / `title` pair (pinned by W1134) the SOLE accessible
 * name for the button — without `aria-hidden`, the chevron's literal
 * Unicode codepoint (U+2039 / U+203A "single angle quotation mark")
 * would be concatenated into the accessible name by the browser's
 * AccName algorithm, producing announcements like "Collapse category
 * drawer ‹" — punctuation-as-noise that varies by toggle state.
 *
 * W1134 / LobbyDrawerToggleLabel.test.tsx pins the glyph's TEXTCONTENT
 * swap (`‹` vs `›`) but never asserts the wrapper span's `aria-hidden`
 * attribute — its docstring even calls it out as "the chevron is
 * `aria-hidden`" while only checking `toggle.textContent`. A regression
 * that dropped the attribute (or moved it to the button itself, which
 * would orphan the button from AT entirely) would slip past every
 * existing drawer-toggle test. This file fills exactly that gap.
 *
 * Lives in a NEW SIBLING file (not LobbyDrawerToggleLabel.test.tsx or
 * LobbyPage.test.tsx) because both are concurrently edited by many
 * agents — adding here avoids merge churn while pinning a distinct
 * a11y contract on a separate DOM node (the inner span, not the
 * outer button).
 */
describe("LobbyPage — drawer toggle inner glyph aria-hidden (W1265)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1134 / W1239
    // sibling harnesses: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer aside
    // (and its toggle, and hence the inner glyph span) would not mount.
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

  it("the chevron glyph is wrapped in a span with aria-hidden=\"true\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const toggle = screen.getByTestId("lobby-drawer-toggle");
    // The button's first (and only) element child is the wrapper span
    // that carries the chevron. Anchoring on `firstElementChild` (not
    // a `.querySelector("span")`) pins the structural contract: the
    // glyph must be a direct child element, not buried under another
    // wrapper that might absorb pointer events or alter focus order.
    const glyphSpan = toggle.firstElementChild;
    expect(glyphSpan).not.toBeNull();
    expect(glyphSpan!.tagName).toBe("SPAN");
    // The string literal "true" — React serialises `aria-hidden={true}`
    // (boolean) and `aria-hidden="true"` (string) identically into the
    // DOM, but pinning the string form here matches the JSX exactly
    // and guards against an accidental switch to `aria-hidden={false}`
    // (which renders the attribute as the literal "false" — still
    // present but inverted in meaning).
    expect(glyphSpan!.getAttribute("aria-hidden")).toBe("true");
    // The chevron textContent itself lives ON the span (not a deeper
    // child) — `‹` on initial render because the drawer is expanded.
    // Pinning here proves the `aria-hidden` attribute is on the SAME
    // node that carries the visible glyph, not on an empty sibling.
    expect(glyphSpan!.textContent).toBe("‹");
  });
});
