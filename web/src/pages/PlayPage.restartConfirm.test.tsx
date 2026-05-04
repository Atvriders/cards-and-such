/**
 * Unit test for the PlayPage restart-confirm flow (W723).
 *
 * Companion to W719 (PlayPage.newGame.test.tsx) which covered the
 * no-confirm path (elapsed ≈ 0, actionCount ≤ 5). This test exercises
 * the in-progress short-circuit in `confirmIfInProgress`:
 *
 *     const inProgress = elapsed > 30 || actionCountRef.current > 5;
 *
 * Strategy:
 *   - Wrap PlayPage in ConfirmProvider so the dialog actually mounts
 *     when `showConfirm` is invoked.
 *   - Click `start-game` then dispatch six "inc" actions to push
 *     `actionCountRef.current` to 6 (> 5), crossing the threshold while
 *     keeping `elapsed` ≈ 0.
 *   - Click `play-restart-btn`. Because the game now counts as
 *     in-progress, `replay` awaits a ConfirmDialog instead of restarting
 *     immediately.
 *   - Assert the dialog mounts (testid "confirm-dialog"), click
 *     `confirm-yes`, and verify state was reset (fx-count back to 0,
 *     undo button disabled).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — same shape as the W719 newGame test so we
// can drive PlayPage's action counter past the 5-action threshold.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "restart-confirm-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Restart Confirm Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the restart-confirm test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
    isTerminal: () => null,
    component: ({
      state,
      dispatch,
    }: {
      state: State;
      dispatch: (a: Action) => void;
    }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
        <button
          data-testid="fx-inc"
          type="button"
          onClick={() => dispatch({ type: "inc" })}
        >
          inc
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship — null-stub keeps any
// stray render path side-effect-free.
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

describe("PlayPage restart confirm dialog (W723)", () => {
  it("prompts the user when restarting an in-progress game and resets on confirm", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <ConfirmProvider>
        <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
          <Routes>
            <Route path="/play/:gameId" element={<PlayPage />} />
          </Routes>
        </MemoryRouter>
      </ConfirmProvider>,
    );

    // Move past the setup screen so the fixture's component mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Dispatch 6 actions to cross the actionCount > 5 threshold.
    // elapsed remains ≈ 0, so the dialog only mounts because of the
    // action-count branch of `inProgress`.
    const incBtn = screen.getByTestId("fx-inc");
    for (let i = 0; i < 6; i++) fireEvent.click(incBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("6");

    // Click Restart. With actionCount = 6 the replay() callback awaits
    // showConfirm — the dialog must mount instead of resetting state.
    await act(async () => {
      fireEvent.click(screen.getByTestId("play-restart-btn"));
      await Promise.resolve();
    });

    // ConfirmDialog should now be visible.
    expect(screen.getByTestId("confirm-dialog")).toBeTruthy();
    // count is unchanged because we haven't confirmed yet.
    expect(screen.getByTestId("fx-count").textContent).toBe("6");

    // Click "Restart" inside the dialog. The promise resolves true and
    // `replay` calls startWithSeed(seed), which clears the undo stack
    // and re-installs initialState.
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirm-yes"));
      await Promise.resolve();
    });

    // Dialog has unmounted.
    expect(screen.queryByTestId("confirm-dialog")).toBeNull();
    // initialState was re-installed: count is 0 again.
    expect(screen.getByTestId("fx-count").textContent).toBe("0");
    // setUndoStack([]) inside startWithSeed cleared the ring buffer,
    // so the undo button must flip back to disabled.
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

describe("PlayPage restart confirm dialog cancel path (W726)", () => {
  it("preserves game state when the user cancels the restart confirm dialog", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <ConfirmProvider>
        <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
          <Routes>
            <Route path="/play/:gameId" element={<PlayPage />} />
          </Routes>
        </MemoryRouter>
      </ConfirmProvider>,
    );

    // Move past the setup screen so the fixture's component mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-count").textContent).toBe("0");

    // Dispatch 6 actions to cross the actionCount > 5 threshold so that
    // restart counts as in-progress and the dialog mounts.
    const incBtn = screen.getByTestId("fx-inc");
    for (let i = 0; i < 6; i++) fireEvent.click(incBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("6");

    // Click Restart — dialog should mount because game is in-progress.
    await act(async () => {
      fireEvent.click(screen.getByTestId("play-restart-btn"));
      await Promise.resolve();
    });

    expect(screen.getByTestId("confirm-dialog")).toBeTruthy();
    // count is unchanged before the user answers.
    expect(screen.getByTestId("fx-count").textContent).toBe("6");

    // Click Cancel ("confirm-no"). The promise resolves false and replay()
    // returns early without touching state or the undo stack.
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirm-no"));
      await Promise.resolve();
    });

    // Dialog has unmounted.
    expect(screen.queryByTestId("confirm-dialog")).toBeNull();
    // State is preserved: count remains 6 (no replay/reset happened).
    expect(screen.getByTestId("fx-count").textContent).toBe("6");
    // Undo stack is intact, so the undo button stays enabled.
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
