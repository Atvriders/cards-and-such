/**
 * Unit test for the PlayPage end-banner "New Game" button on the loss
 * path (W861).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2720-2728) renders an `end-actions` row inside the
 *   shared end-panel — i.e. *not* gated on `isWin` — that contains a
 *   `<button data-testid="new-game-btn">` whose onClick invokes `newGame`,
 *   which in turn calls `startWithSeed(randomSeed())`. That callback resets
 *   `finalScore` to null and flips `phase` back to "playing", which closes
 *   the end-panel render gate (`phase === "ended" && finalScore !== null`)
 *   and tears the panel down. Sibling W822 pins this restart contract on
 *   the WIN path (positive-score terminal). W845/W850/W856 pin the
 *   loss-banner headline, end-seed copy, and back-to-lobby link on the
 *   LOSS path, but none assert that the New-Game button still tears the
 *   panel down and restarts the round when the player ends in defeat.
 *
 *   A regression that wrapped the button in an `isWin && (...)` guard,
 *   that swapped the click handler to a no-op on the loss branch, or that
 *   only reset `finalScore` without flipping `phase` back to "playing"
 *   would silently strip the most prominent restart affordance for losing
 *   players while every other end-panel test continued to pass.
 *
 * Strategy:
 *   Mirror W845's loss fixture — a reducer that flips into
 *   `isTerminal: { score: 0 }` on a single dispatched action — so PlayPage
 *   walks the loss branch (`isWin === false`, `isLoss === true`,
 *   `showLossBanner === true`). After the loss banner mounts, click
 *   `new-game-btn` and assert both `end-panel` and `new-game-btn` unmount —
 *   the strongest visible signal that the click actually restarted the
 *   round (a no-op click would leave both nodes in the tree).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — mirrors W845. Reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action; isTerminal returning a
// zero-or-negative score is the canonical "loss" discriminator (see
// PlayPage.tsx ~line 1384, `isWin = ... && finalScore > 0`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-new-game-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner New Game Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner New Game button test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ lost: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "LOSE" ? { lost: true } : s,
    isTerminal: (s: State) => (s.lost ? { score: 0 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-lose"
          onClick={() => dispatch({ type: "LOSE" })}
        >
          lose
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
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss-banner New Game button (W861)", () => {
  it("restarts the round and tears down the end-panel when clicked after a loss", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Pre-condition: end-panel + new-game-btn are not mounted before the
    // game ends — they live inside the `phase === "ended"` branch.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(screen.queryByTestId("new-game-btn")).toBeNull();

    // Drive the round into terminal-loss (score === 0).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity-check the loss branch is the one driving render — guards
    // against a fixture mis-wire that accidentally produced a positive
    // score and made this test a duplicate of W822.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-after-loss assertion: the New Game button must be
    // mounted on the LOSS-path end-panel. A regression that wrapped it
    // in an `isWin && (...)` guard would surface here.
    const btn = screen.getByTestId("new-game-btn");
    expect(btn).toBeTruthy();

    // Click. `newGame` skips the in-progress confirm (phase is "ended",
    // not "playing") and calls `startWithSeed(randomSeed())`, which
    // resets `finalScore` to null and flips `phase` back to "playing".
    await act(async () => {
      fireEvent.click(btn);
    });

    // The contract pin: after the click, the end-panel render gate
    // (`phase === "ended" && finalScore !== null`) is closed and the
    // entire panel — including the New Game button — is unmounted.
    // A no-op click handler would leave both nodes in the tree; a
    // regression that reset score but not phase would also leave the
    // panel mounted. Asserting both nodes vanish is the strongest
    // visible signal that the round actually restarted from a loss.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(screen.queryByTestId("new-game-btn")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
