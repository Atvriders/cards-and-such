/**
 * Unit test for the PlayPage end-banner "New Game" button (W822).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2721) renders an
 *   `end-actions` row whose primary CTA is a `<button data-testid="new-game-btn">`
 *   labelled `t("hud.new_game")` ("New Game"). Clicking it invokes the
 *   `newGame` callback, which calls `startWithSeed(randomSeed())` —
 *   tearing the end-panel down (`setFinalScore(null)` + `setPhase("playing")`)
 *   and starting a fresh round with a new seed. Sibling tests pin the score
 *   (W805), time (W809), best (W814), record (W816), seed (W818), back-link
 *   (W813), Twitter share (W810), copy-link share (W678), share-image (W796),
 *   print (W778) and save-replay (W642/W699/W729) controls — but none pin
 *   the New Game button itself. A regression that dropped the button,
 *   swapped its label, mis-wired the click to a no-op, or forgot to
 *   transition `phase` out of "ended" would silently break the round's
 *   most prominent restart affordance while every neighbouring end-panel
 *   test continued to pass.
 *
 * Strategy mirrors W813's win-banner fixture pattern:
 *   - A hoisted fixture plugin whose reducer flips `isTerminal` to a
 *     positive-score payload after one dispatch drives PlayPage into the
 *     terminal-win branch with `?quickstart=1` skipping setup.
 *   - After the win, assert (a) `new-game-btn` is mounted, (b) its visible
 *     text is "New Game" (the hud.new_game translation), then click it.
 *   - The contract pin: after the click, the end-panel (`end-panel`
 *     testid) must be unmounted because `startWithSeed` resets
 *     `finalScore` to null and the panel's render gate
 *     (`phase === "ended" && finalScore !== null`) closes. That's the
 *     strongest visible signal that the click actually restarted the
 *     game — a no-op click would leave the end-panel mounted.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload once `moves >= 1`, so a single dispatch from
// the fixture button drives PlayPage into the terminal-win branch and
// mounts the `new-game-btn` button inside the end-actions row.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-new-game-btn-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End New Game Btn Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-banner New Game button test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 100 } : null,
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

describe("PlayPage end-banner New Game button (W822)", () => {
  it("restarts the round and tears down the end-panel when clicked after a win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-panel + new-game-btn are not mounted before the
    // game ends — they live inside the `phase === "ended"` branch.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(screen.queryByTestId("new-game-btn")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the New Game button must now be
    // mounted on the end-panel. A regression that dropped the testid or
    // hid the button on the win path would surface here even if the
    // click handler was still wired correctly.
    const btn = screen.getByTestId("new-game-btn");
    expect(btn).toBeTruthy();

    // Label assertion. The button copy is sourced from the `hud.new_game`
    // translation key ("New Game" in the default en bundle) — pinning
    // the text guards against an accidental swap to "Replay" or
    // "Restart" while the click wiring stays intact.
    expect(btn.textContent).toBe("New Game");

    // Sanity-check we're really on the end-panel before the click —
    // otherwise a green test post-click would be vacuously true.
    expect(screen.getByTestId("end-panel")).toBeTruthy();

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
    // visible signal that the round actually restarted.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(screen.queryByTestId("new-game-btn")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
