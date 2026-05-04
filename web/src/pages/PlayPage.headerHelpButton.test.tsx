/**
 * Unit test for the PlayPage header help button UI contract (W914).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2124) renders a `<button data-testid="help-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   active plugin defines `howToPlay` text (or `tutorialSteps`). It is a
 *   `type="button"` (so a stray wrapping form can never submit), it
 *   carries an aria-label of "How to play" (announcing intent to screen
 *   readers — the only label, since the button is icon-only), and it
 *   shows a visible question-mark-in-circle SVG glyph. Sibling tests
 *   cover the popover contents (W691 howToPlay-rendering, etc.) and the
 *   gating (the button hides when `howToPlay` is absent), but no test
 *   pins the button's *visible UI attributes* — so a regression that
 *   swapped the aria-label for "Help" (drift), set `type="submit"`
 *   (form-bug), or replaced the inline SVG with a text glyph would slip
 *   past every existing test.
 *
 *   Unlike the info-btn (which is in the title row and renders in every
 *   phase), this button only mounts when (a) the game is past setup and
 *   (b) the plugin actually has `howToPlay` text (or tutorialSteps), so
 *   we mock a fixture plugin with a one-liner howToPlay and click
 *   `start-game` to advance to the playing phase.
 *
 * Strategy mirrors PlayPage.headerInfoButton.test.tsx (W900) and
 * PlayPage.headerSettingsButton.test.tsx (W906):
 *   - Hoisted minimal fixture plugin with `howToPlay` text so the
 *     iconbar branch (`plugin.howToPlay || tutorialSteps`) resolves true.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Pin four static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "How to play" (screen-reader contract).
 *       4. an inline <svg> glyph child (visible icon contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `howToPlay` must be a non-empty string so the iconbar branch
// (`plugin.howToPlay || tutorialSteps`) renders the help button. (Per the
// W691 finding: the help-btn is gated on howToPlay/tutorialSteps presence
// — without it the button never mounts and getByTestId would throw.)
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-help-btn-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Help Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header help-button UI test.",
    howToPlay: "Click cards to play. Match suits to win.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header help button UI contract (W914)", () => {
  it("renders a <button type='button'> with the 'How to play' a11y label and visible SVG glyph", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Help button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("help-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract — the button has no visible text label
    // (just the SVG question-mark glyph), so the aria-label *is* the
    // only label exposed to assistive tech.
    expect(btn.getAttribute("aria-label")).toBe("How to play");

    // Visible glyph contract — the only sighted-user signal that this
    // is the help button. Replacing the inline question-mark SVG with a
    // text glyph or removing it entirely would break visual recognition
    // while a11y stayed green.
    const svg = btn.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
