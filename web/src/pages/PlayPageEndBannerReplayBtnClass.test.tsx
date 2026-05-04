/**
 * Unit test for the win-banner replay-btn `play-replay-btn` class modifier
 * (W1436).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2729-2736) renders the end-actions row with two
 *   sibling primary CTAs — `new-game-btn` and `replay-btn`. Both use the
 *   shared `play-again-btn play-again-btn--big` size/shape classes, but the
 *   replay button gets an extra `play-replay-btn` modifier wedged between
 *   them. That modifier is the only CSS hook the stylesheet uses to give
 *   the replay button a distinct accent (e.g. secondary-action color) so a
 *   user scanning the end-actions row can tell at a glance which button
 *   restarts the same deal vs. which deals a fresh seed.
 *
 *   Sibling tests cover *other* attrs on these buttons:
 *     - PlayPage.lossBannerReplayBtnLabel.test.tsx — visible "Replay" label
 *     - PlayPage.lossBannerReplayBtn.test.tsx     — Enter-key + click action
 *     - PlayPage.endActionsStructural.test.tsx    — both buttons mount in row
 *     - PlayPage.endNewGameBtn.test.tsx           — new-game-btn click action
 *     - PlayPage.winBannerAutoFocus.test.tsx      — new-game autofocus on win
 *   None of them pin the literal `play-replay-btn` modifier class on the
 *   replay-btn element. A regression that dropped or renamed that token
 *   (e.g. "play-replay" / "replay-btn-modifier" / accidentally collapsing
 *   replay-btn's className to match new-game-btn's verbatim) would make
 *   the two buttons visually indistinguishable while every label, click,
 *   and structural test stayed green.
 *
 * Strategy:
 *   - Reuse the win-after-one-move hoisted fixture pattern from sibling
 *     PlayPageEndBannerSaveReplayType tests so a single dispatch drives
 *     PlayPage into the terminal-win branch that mounts both end-actions
 *     buttons.
 *   - Assert the `replay-btn` element's `classList` contains the literal
 *     `play-replay-btn` token. Using `classList.contains` (not a substring
 *     match on `className`) guards against a false-positive where some
 *     other class happens to embed "play-replay-btn" as a fragment.
 *   - No click on the button: this is a static-mount class contract, not
 *     a behavior pin (those are covered by W881/W889 and lossBannerReplayBtn).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted win-after-one-move fixture. Reducer increments `moves`; isTerminal
// returns a positive-score payload once `moves >= 1`, so a single dispatch
// drives PlayPage into the terminal-win branch that mounts the end-actions
// row containing both `new-game-btn` and `replay-btn`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "replay-btn-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Replay Btn Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-btn play-replay-btn class.",
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

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal-win render side-effect-free, mirroring sibling tests.
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

describe("PlayPage win-banner replay-btn play-replay-btn class (W1436)", () => {
  it("carries the play-replay-btn modifier class that distinguishes it from new-game-btn", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win so the end-actions row (and its
    // replay-btn child) mounts.
    fireEvent.click(screen.getByTestId("fx-win"));

    const replayBtn = screen.getByTestId("replay-btn");

    // Lock the contract: replay-btn's classList must include the literal
    // `play-replay-btn` modifier. Removing/renaming that token would
    // collapse the visual distinction between replay-btn and its sibling
    // new-game-btn while every label/click/structural sibling test stayed
    // green.
    expect(replayBtn.classList.contains("play-replay-btn")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
