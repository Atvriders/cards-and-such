/**
 * Structural test for the PlayPage `.final-score-label` *tag name* (W1414).
 *
 * Observable behavior:
 *   When the round reaches a terminal state, PlayPage.tsx (~line 2693)
 *   renders the score caption as a `<div className="final-score-label">`,
 *   sandwiched between the `<div class="final-score">` headline and the
 *   `<dl class="end-stats">` definition list inside the end-panel. The
 *   PlayPage.css rule for `.final-score-label` is class-keyed but the
 *   surrounding flex layout in `.end-panel` assumes the caption is a
 *   block-level element; a regression that switched the wrapper to e.g.
 *   `<span>` (an inline element) would silently collapse the caption's
 *   margin-top against the giant score number above it and break the
 *   intended typographic spacing.
 *
 *   The sibling W1116 test (PlayPage.endStatsClass.test.tsx) pins the
 *   `.final-score-label` *class* and its position inside the end-panel,
 *   but it never asserts the wrapper's tagName, so a switch from `<div>`
 *   to `<span>` (or any other element) would slip through. An exhaustive
 *   grep across PlayPage*.test.tsx for `final-score-label.*tagName` /
 *   `tagName.*final-score-label` returns zero hits — this test fills
 *   that exact gap with the minimum surface: drive the round to
 *   terminal-win, locate `.final-score-label` by its CSS class, and pin
 *   `tagName === "DIV"`.
 *
 * Strategy mirrors W1116 (PlayPage.endStatsClass.test.tsx) and W1398
 * (PlayPageEndStatsTimeDtTag.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — enough to drive
 *     PlayPage into the terminal-win branch where `.final-score-label`
 *     mounts.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, locate `.final-score-label`, and
 *     assert its tagName is "DIV".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "final-score-label-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Final Score Label Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the final-score-label tagName test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 42 } : null,
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

describe("PlayPage .final-score-label tagName (W1414)", () => {
  it("renders the .final-score-label caption as a <div> after a win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-panel (and therefore the caption) is gated on
    // the terminal phase, so it must not exist before the win.
    expect(container.querySelector(".final-score-label")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const label = container.querySelector(".final-score-label");
    expect(label).not.toBeNull();

    // Pin the wrapper's tagName. The end-panel flex layout assumes a
    // block-level caption; a switch to <span> (or any inline element)
    // would silently collapse the caption's vertical spacing against
    // the `.final-score` headline above it.
    expect(label!.tagName).toBe("DIV");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
