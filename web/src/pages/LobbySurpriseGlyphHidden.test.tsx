import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1282 — the "Surprise me" hero-stat button (data-testid
 * `lobby-surprise`) wraps its decorative dice glyph in a
 * `<span class="lobby-stat-glyph" aria-hidden="true">🎲</span>`.
 *
 * The hidden-from-AT contract on that inner span is what makes
 * the button's `aria-label="Open a random game"` (pinned by W579 /
 * LobbyPage.test.tsx) the SOLE accessible name. Without
 * `aria-hidden`, the dice emoji's literal codepoint (U+1F3B2 "GAME
 * DIE") would be concatenated into the accessible name by the
 * browser's AccName algorithm, producing announcements like
 * "Open a random game 🎲 Lucky Surprise me" — emoji noise plus
 * duplication of the visible labels (which W1222 /
 * LobbyHeroSurpriseLabels.test.tsx already pins).
 *
 * W1222 pins the visible textContent of `.lobby-stat-count` and
 * `.lobby-stat-label` inside the surprise tile but says NOTHING
 * about the sibling `.lobby-stat-glyph` span — neither its
 * `aria-hidden` attribute nor its placement as a button child.
 * A regression that removed `aria-hidden="true"` (or flipped it to
 * `aria-hidden="false"`) would slip past every existing surprise-
 * button test.
 *
 * Sibling-file placement keeps the test under the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to LobbyPage.test.tsx or LobbyHeroSurpriseLabels.
 */
describe("LobbyPage — surprise-me dice glyph aria-hidden (W1282)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("the dice glyph span carries aria-hidden=\"true\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("lobby-surprise");

    // Resolve the glyph span via its className (mirrors the
    // per-category stat tile structure) so the lookup is
    // independent of child-order changes that might insert other
    // decorative spans (e.g. a future sparkline).
    const glyph = btn.querySelector<HTMLElement>(".lobby-stat-glyph");
    expect(glyph).not.toBeNull();
    expect(glyph!.tagName).toBe("SPAN");

    // The string literal "true" — React serialises
    // `aria-hidden={true}` (boolean) and `aria-hidden="true"`
    // (string) identically into the DOM, but pinning the string
    // form here matches the JSX exactly and guards against an
    // accidental switch to `aria-hidden={false}` (which renders
    // the attribute as the literal "false" — still present but
    // inverted in meaning).
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");

    // The dice emoji itself lives ON the glyph span (not a deeper
    // child) — pinning here proves the `aria-hidden` attribute is
    // on the SAME node that carries the visible emoji, not on an
    // empty sibling that would leave the emoji exposed to AT.
    expect(glyph!.textContent).toBe("🎲");
  });
});
