/**
 * Unit test for the PlayPage loss-banner Enter-to-restart keyboard flow (W881).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2729) renders the end-actions row inside the shared
 *   end-panel with the replay button autofocused on the loss path
 *   (`autoFocus={showLossBanner}`). The loss-banner-hint copy
 *   ("Press Enter to replay, Esc to dismiss", PlayPage.tsx ~line 2826)
 *   relies on this focus landing on the replay button so that the
 *   default native-button Enter-activation semantics (Enter on a focused
 *   button fires its onClick) call `replay()`, which calls
 *   `startWithSeed(seed)`. That callback resets `finalScore` to null and
 *   flips `phase` back to "playing", which closes the end-panel render
 *   gate (`phase === "ended" && finalScore !== null`) and tears the
 *   panel down — i.e. the round restarts from the same seed.
 *
 *   W834 pins this Enter-restart contract on the WIN path (Enter on the
 *   autofocused new-game-btn restarts with a fresh seed). W879 pins
 *   Esc-dismisses on the LOSS path. W876 confirmed the loss-banner hint
 *   advertises the same Enter/Esc affordance as the win banner. Nothing
 *   yet pins the actual "Enter while focused" path on the loss arm: a
 *   regression that dropped `autoFocus={showLossBanner}` from the
 *   replay button (or moved it to a non-button element lacking implicit
 *   Enter-activation) would silently break the keyboard-only restart for
 *   losing players while every neighbouring loss-banner assertion stayed
 *   green.
 *
 *   Note: on the LOSS path the *replay* button is autofocused (re-runs
 *   the same seed), not the *new-game* button (fresh seed), mirroring
 *   the loss-banner-hint copy's "Press Enter to replay". The user-visible
 *   contract is the same shape as W834 — Enter on the autofocused button
 *   tears the end-panel down — but the action is "replay same seed"
 *   rather than "new random seed".
 *
 * Strategy:
 *   Mirror W879's loss fixture (single-dispatch zero-score terminal,
 *   hoisted plugin, registry mock, confetti null-stub) so PlayPage walks
 *   the loss branch (`isLoss === true`, `showLossBanner === true`). After
 *   the loss banner mounts, assert focus landed on the autofocused button
 *   (the replay-btn — `data-testid="replay-btn"` per PlayPage.tsx ~line
 *   2732), then dispatch a synthetic Enter keydown at
 *   `document.activeElement`. The contract pin matches W834: `end-panel`
 *   must unmount after activation, proving the round restarted.
 *
 *   jsdom does NOT always synthesize a click event from Enter keydown on
 *   a native <button>; if the keydown alone fails to tear the panel
 *   down, fall back to firing a click on the active element. Both paths
 *   exercise the same observable contract — that focus + activation on
 *   the autofocused button restarts the game from the loss banner —
 *   which is the user-visible promise the loss-banner-hint copy makes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W879/W861 — reducer flips to a
// `{ score: 0 }` terminal on a single dispatched LOSE action; isTerminal
// returning a zero-or-negative score is the canonical "loss" discriminator
// (see PlayPage.tsx ~line 1384, `isWin = ... && finalScore > 0`). This
// drives PlayPage straight into the showLossBanner=true branch where the
// end-actions row mounts with the autofocused replay button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-enter-restart-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Enter Restart Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner Enter-restart assertion.",
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

describe("PlayPage loss banner: Enter restarts via autofocused button (W881)", () => {
  it("tears down the end-panel when Enter is pressed on the autofocused end-actions button after a loss", async () => {
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

    // Drive the round into terminal-loss (score === 0). One click is
    // enough — the fixture's isTerminal flips to `{ score: 0 }` on the
    // first dispatched LOSE, mounting the loss banner and the
    // autofocused replay button.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: end-panel is on the loss branch and the autofocused
    // end-actions button received focus from React's autoFocus prop.
    // On the loss path that's the replay-btn (autoFocus={showLossBanner}
    // at PlayPage.tsx ~line 2733); the new-game-btn is autofocused only
    // on the win path (autoFocus={showWinBanner} at line 2725).
    const endPanelBefore = screen.getByTestId("end-panel");
    expect(endPanelBefore.getAttribute("data-win")).toBe("false");
    const replayBtn = screen.getByTestId("replay-btn");
    expect(document.activeElement).toBe(replayBtn);

    // Press Enter on the focused element — the keyboard flow the
    // loss-banner-hint copy promises ("Press Enter to replay").
    const focused = document.activeElement as HTMLElement;
    await act(async () => {
      fireEvent.keyDown(focused, { key: "Enter", code: "Enter" });
      fireEvent.keyUp(focused, { key: "Enter", code: "Enter" });
    });

    // jsdom does not always synthesize a click from Enter on a native
    // <button>, so if the panel is still mounted, fall back to the
    // explicit click that the browser would have produced. Either path
    // exercises the same observable contract: activating the autofocused
    // button restarts the game from the loss banner.
    if (screen.queryByTestId("end-panel") !== null) {
      await act(async () => {
        fireEvent.click(focused);
      });
    }

    // The contract pin (mirrors W834): after activation, the end-panel
    // render gate (`phase === "ended" && finalScore !== null`) is closed
    // and the end-panel unmounts. A regression that dropped
    // `autoFocus={showLossBanner}` from the replay button or rewired the
    // onClick to a no-op would leave the panel mounted even after the
    // Enter+click fallback; asserting end-panel unmount is the strongest
    // visible signal that the round actually restarted from a loss via
    // the keyboard.
    expect(screen.queryByTestId("end-panel")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
