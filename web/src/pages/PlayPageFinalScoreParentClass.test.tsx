/**
 * Structural test for the PlayPage end-banner final-score wrapper's
 * *parent element className* (W1459).
 *
 * Observable behavior:
 *   When the round reaches a terminal state, PlayPage.tsx (~line 2686)
 *   renders the final-score node as a direct child of the end-panel
 *   `<section>`:
 *
 *     <section className="end-panel ..." data-testid="end-panel">
 *       ...
 *       <div
 *         className="final-score ..."
 *         data-testid="final-score"
 *         aria-label="Final score N"
 *       >
 *         {finalScore}
 *       </div>
 *       <div className="final-score-label">{t("hud.score")}</div>
 *       ...
 *     </section>
 *
 *   The structural contract that the final-score headline lives directly
 *   inside the `.end-panel` flex column is what wires its giant typography
 *   to the surrounding caption + end-stats spacing rules; if a refactor
 *   accidentally re-parented the final-score under a sibling wrapper (for
 *   example, an extra `<div className="end-panel-body">` or moved it into
 *   the `<dl class="end-stats">`), the visual rhythm of the end-panel
 *   would silently break while every existing class / aria-label / value
 *   assertion continued to pass.
 *
 *   Sibling tests already cover:
 *     - W805 / W1115: the final-score's data-testid + aria-label.
 *     - W1094 / W1336: the `final-score` base + `--win` modifier classes.
 *     - W1406: the final-score wrapper's tagName.
 *     - W1414: the `.final-score-label` caption tagName.
 *   None of them pin the final-score's *parent element* — an exhaustive
 *   grep across PlayPage*.test.tsx for `finalScore.parentElement` /
 *   `parent.*end-panel` / `end-panel.*final-score.parent` returns zero
 *   hits. This test fills that exact gap.
 *
 * Strategy mirrors the W1406 / W1414 hoisted fixture pattern:
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — enough to drive
 *     PlayPage into the terminal-win branch where the end-panel mounts.
 *   - Mount at `/play/:gameId?seed=1&quickstart=1` to skip setup.
 *   - Click the fixture's win button, locate the final-score by testid,
 *     then assert its `parentElement.classList.contains("end-panel")`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as the W1406 / W1414 win-banner fixtures.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "final-score-parent-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Final Score Parent Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the final-score parent-class structural test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 7 } : null,
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

describe("PlayPage end-banner final-score parent className (W1459)", () => {
  it("renders the final-score node as a direct child of `.end-panel` after a win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const finalScore = screen.getByTestId("final-score");
    const parent = finalScore.parentElement;

    // Pin the structural relationship: the final-score headline must
    // live directly inside the `.end-panel` flex column. A regression
    // that re-parented the final-score under any sibling wrapper would
    // silently break the surrounding typographic rhythm.
    expect(parent).not.toBeNull();
    expect(parent!.classList.contains("end-panel")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
