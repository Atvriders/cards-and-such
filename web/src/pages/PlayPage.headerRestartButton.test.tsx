/**
 * Unit test for the PlayPage header restart button UI contract (W925).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2041) renders a `<button data-testid="play-restart-btn">`
 *   in the header iconbar whenever `phase === "playing"`. It is a
 *   `type="button"` (so a stray wrapping form can never submit), it
 *   carries an aria-label of "Restart" (announcing intent to screen
 *   readers — the only label, since the button is icon-only), and it
 *   shows a visible counter-clockwise arrow SVG glyph. Sibling tests
 *   cover the replay action wiring and the R-hotkey path, but no test
 *   pins the button's *visible UI attributes* — so a regression that
 *   swapped the aria-label for "Reset" (drift), set `type="submit"`
 *   (form-bug), or replaced the inline SVG with a text glyph would slip
 *   past every existing test.
 *
 *   Like the settings/help buttons, the restart button only mounts when
 *   the game is past setup, so we mock a minimal Counter-style fixture
 *   plugin and click `start-game` to advance to the playing phase.
 *
 * Strategy mirrors PlayPage.headerInfoButton.test.tsx (W900),
 * PlayPage.headerSettingsButton.test.tsx (W906), and
 * PlayPage.headerHelpButton.test.tsx (W914):
 *   - Hoisted minimal Counter fixture plugin so the registry resolves.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Pin four static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Restart" (screen-reader contract).
 *       4. an inline <svg> glyph child (visible icon contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted Counter fixture — vi.hoisted runs before vi.mock factories evaluate.
// The restart button mounts unconditionally in the playing phase (no
// settings/howToPlay gating), so a minimal counter plugin suffices.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-restart-btn-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Restart Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header restart-button UI test.",
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

describe("PlayPage header restart button UI contract (W925)", () => {
  it("renders a <button type='button'> with the 'Restart' a11y label and visible SVG glyph", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Restart button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract — the button has no visible text label
    // (just the SVG counter-clockwise arrow glyph), so the aria-label
    // *is* the only label exposed to assistive tech.
    expect(btn.getAttribute("aria-label")).toBe("Restart");

    // Visible glyph contract — the only sighted-user signal that this
    // is the restart button. Replacing the inline arrow SVG with a text
    // glyph or removing it entirely would break visual recognition
    // while a11y stayed green.
    const svg = btn.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
