/**
 * Unit test for the PlayPage win-banner final-score value (W805).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2686)
 *   renders a `<div data-testid="final-score" aria-label="Final score N">`
 *   whose visible text is the numeric score returned by the plugin's
 *   `isTerminal(...)` payload. That number is the headline outcome the player
 *   sees in the end panel — sibling tests already cover the `game.win`
 *   analytics breadcrumb (W787), the share-seed/save-image/print/save-replay
 *   buttons (W678/W796/W778/W642/W699), the "You won!" headline (W801), and
 *   the confetti plumbing — but no test asserts the actual rendered final
 *   score value. A regression that swapped `finalScore` for `term.score` of
 *   the wrong sign, hard-coded a placeholder, or wired the label to the wrong
 *   variable would silently mis-report the outcome while every existing test
 *   continued to pass.
 *
 * Strategy:
 *   Mirror the hoisted fixture pattern from PlayPage.shareEnd.test.tsx —
 *   a minimal plugin whose reducer increments a `moves` counter and whose
 *   `isTerminal` returns a *distinctive* score (4242) once `moves >= 1`. The
 *   value is intentionally not 1/0/100 so a stray match against an unrelated
 *   counter or default would be obvious. Drive PlayPage to the terminal-win
 *   branch with one click on the fixture's dispatcher button, then assert
 *   both the testid container *and* its visible numeric text + aria-label so
 *   a regression that drops one or the other is caught. `?quickstart=1`
 *   skips the setup screen so the fixture mounts immediately.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload with a distinctive value (4242) once `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage into the
// terminal-win branch and renders the win banner with that score.
// ---------------------------------------------------------------------------
const WINNING_SCORE = 4242;

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-score-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner Score Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner final-score test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    // Distinctive score (4242) so the test assertion can't accidentally
    // coincide with a default/placeholder (0, 1, 100) elsewhere in the DOM.
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 4242 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-win"
          type="button"
          onClick={() => dispatch({ type: "win-now" })}
        >
          win
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// win-banner render fast and side-effect-free.
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

describe("PlayPage win-banner final-score value (W805)", () => {
  it("renders the plugin's terminal score inside the final-score element after a win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: final-score is NOT mounted before the game ends —
    // it lives inside the `phase === "ended"` branch of the JSX.
    expect(screen.queryByTestId("final-score")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns `{ score: 4242 }`, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the final-score node must now be
    // mounted. A regression that dropped the data-testid would surface
    // here even if the visible text remained unchanged.
    const finalScore = screen.getByTestId("final-score");
    expect(finalScore).toBeTruthy();

    // The whole point of the test: the rendered text must be the
    // distinctive score returned by `isTerminal`. `.textContent` is
    // tolerant of incidental whitespace/wrapper changes while still
    // pinning the numeric value contract.
    expect(finalScore.textContent?.trim()).toBe(String(WINNING_SCORE));

    // Belt-and-suspenders: the aria-label is the screen-reader surface
    // for the same value. A regression that wires the label to a
    // stale variable while leaving the visible text correct (or vice
    // versa) is the exact silent failure this assertion catches.
    expect(finalScore.getAttribute("aria-label")).toBe(
      `Final score ${WINNING_SCORE}`,
    );
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
