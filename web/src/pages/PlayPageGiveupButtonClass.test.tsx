/**
 * Unit test for the PlayPage header giveup/restart button className exact
 * equality (W1858).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2041) renders the in-header giveup button — the
 *   "Restart" iconbtn that lets a player abandon the current attempt and
 *   start over — with
 *     `className="play-iconbtn"`
 *   exactly. A single token, no per-button hook (the restart button reuses
 *   the shared iconbar surface without a `play-restart-btn` modifier
 *   class) and no state modifiers.
 *
 *   Sibling test PlayPage.headerRestartButton.test.tsx (W925) pins the
 *   tagName / type / aria-label / glyph contract but explicitly does NOT
 *   pin the className. PlayPage.headerRestartTooltip.test.tsx (W931)
 *   merely mentions className in a comment without asserting it. So a
 *   regression that bolted on an extra modifier (e.g. a stray
 *   `play-restart-btn` or an `is-danger` styling hook) or replaced the
 *   shared `play-iconbtn` token entirely would slip past every existing
 *   test.
 *
 * Strategy mirrors PlayPageHintButtonClass.test.tsx (W1847):
 *   - Hoisted minimal Counter-style fixture plugin so the registry resolves.
 *   - Mount at `/play/:gameId`, click start-game to enter the playing phase
 *     (the restart button only mounts when `phase === "playing"`).
 *   - Locate the button via its `play-restart-btn` testid.
 *   - Assert `btn.className === "play-iconbtn"` exactly so any token-set
 *     drift (extra classes, reordering, whitespace) is caught at the unit
 *     level.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted Counter fixture — vi.hoisted runs before vi.mock factories
// evaluate. The restart button mounts unconditionally in the playing phase
// (no settings/hint/howToPlay gating), so a minimal counter plugin with no
// terminal condition suffices.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "giveup-btn-class-exact-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Giveup Button Class Exact Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the giveup/restart-button exact-className test.",
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

describe("PlayPage header giveup/restart button className exact equality (W1858)", () => {
  it("renders the giveup button with className === 'play-iconbtn' exactly so token-set drift is caught", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The restart (giveup) button only mounts in the playing phase, so
    // advance past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn");

    // Exact-equality contract — guards against extra modifier classes,
    // token reordering, or whitespace drift that `classList.contains`
    // assertions would silently accept.
    expect(btn.className).toBe("play-iconbtn");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
