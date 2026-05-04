import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1291 — the per-tile heart toggle (`tile-fav-toggle-<id>`) wraps its
 * heart glyph (`♡` / `♥`) in a `<span aria-hidden="true">…</span>`. The
 * `aria-hidden` contract on that inner span is what makes the button's
 * `aria-label` ("Add to favorites" / "Remove from favorites") the SOLE
 * accessible name — without it, the bare Unicode heart codepoints
 * (U+2661 / U+2665) would be concatenated into the accessible name by
 * the browser's AccName algorithm, producing inconsistent announcements
 * that vary with toggle state ("Add to favorites ♡" vs "Remove from
 * favorites ♥") and leak punctuation/symbol noise to AT users.
 *
 * Existing coverage:
 *   - LobbyPage.test.tsx W603: pins the `aria-pressed` flip + persistence.
 *   - LobbyPageMenuFav.test.tsx: covers the right-click context-menu
 *     "Add/Remove from favorites" item, NOT the heart-toggle button.
 *   - No test asserts the inner-glyph span's `aria-hidden` attribute.
 *
 * A regression that dropped the attribute (or moved it to the button
 * itself, which would orphan the button from AT entirely) would slip
 * past every existing fav-toggle test. This file fills exactly that gap
 * on the heart-toggle DOM node, mirroring W1265 (drawer-toggle glyph)
 * for the symmetric tile-level a11y contract.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as sibling W874 / W908 / W932 / W951 / W965 / W1244 / W1265:
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-fav-toggle inner glyph aria-hidden (W1291)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wraps the heart glyph in a span with aria-hidden=\"true\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on a deterministic, always-rendered tile id (the same id
    // used by the W603 persistence test) — every tile renders a
    // HeartToggle, so any well-known game id works.
    const heart = await screen.findByTestId("tile-fav-toggle-pool-10ball");

    // The button's first (and only) element child is the wrapper span
    // that carries the heart glyph. Anchoring on `firstElementChild`
    // (not a `.querySelector("span")`) pins the structural contract:
    // the glyph must be a direct child element, not buried under
    // another wrapper that might absorb pointer events or alter focus.
    const glyphSpan = heart.firstElementChild;
    expect(glyphSpan).not.toBeNull();
    expect(glyphSpan!.tagName).toBe("SPAN");

    // The string literal "true" — React serialises `aria-hidden={true}`
    // (boolean) and `aria-hidden="true"` (string) identically into the
    // DOM, but pinning the string form here matches the JSX exactly
    // and guards against an accidental switch to `aria-hidden={false}`
    // (which renders the attribute as the literal "false" — still
    // present but inverted in meaning).
    expect(glyphSpan!.getAttribute("aria-hidden")).toBe("true");

    // Initial render: fresh user has no favorites, so the empty-heart
    // codepoint U+2661 (♡) is what sits on the span. Pinning here
    // proves the `aria-hidden` attribute is on the SAME node that
    // carries the visible glyph, not on an empty sibling.
    expect(glyphSpan!.textContent).toBe("♡");
  });
});
