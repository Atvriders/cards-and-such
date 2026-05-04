/**
 * Unit test for the win-banner new-game-btn `play-again-btn--big` class
 * modifier (W1439).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2721-2728) renders the end-actions row's primary
 *   "New game" CTA as a `<button data-testid="new-game-btn">` with the
 *   className `play-again-btn play-again-btn--big`. The shared
 *   `play-again-btn` token gives both end-action buttons their pill base,
 *   while the `play-again-btn--big` modifier is what scales the primary
 *   CTAs (new-game-btn + replay-btn) up so they read as the dominant
 *   affordances on the end-panel — distinct from the smaller pill share
 *   buttons in the sibling end-share-row (which use only `play-share-pill`,
 *   not the `--big` size modifier).
 *
 *   Sibling tests pin *other* attrs in this same end-actions cluster:
 *     - PlayPageEndBannerReplayBtnClass.test.tsx — `play-replay-btn` modifier
 *       on the replay-btn (W1436)
 *     - PlayPage.endNewGameBtn.test.tsx          — new-game-btn click action
 *     - PlayPage.winBannerAutoFocus.test.tsx     — new-game autofocus on win
 *     - PlayPage.endActionsStructural.test.tsx   — both buttons mount in row
 *     - PlayPage.lossBannerReplayBtnLabel.test.tsx — replay-btn visible label
 *   None of them lock the literal `play-again-btn--big` size token on
 *   new-game-btn itself. A regression that dropped the `--big` modifier
 *   (e.g. collapsing className to just `play-again-btn`, renaming to
 *   `play-again-btn-large`, or accidentally swapping in `play-share-pill`)
 *   would visually shrink the primary CTA to share-pill size while every
 *   click, autofocus, label, and structural test stayed green.
 *
 * Strategy:
 *   - Reuse the win-after-one-move hoisted fixture pattern from
 *     PlayPageEndBannerReplayBtnClass so a single dispatch drives PlayPage
 *     into the terminal-win branch that mounts the end-actions row.
 *   - Assert new-game-btn's `classList` contains the literal
 *     `play-again-btn--big` token. Using `classList.contains` (not a
 *     substring match) guards against a false-positive where some other
 *     class happens to embed `play-again-btn--big` as a fragment.
 *   - No click on the button: this is a static-mount class contract, not
 *     a behavior pin (those are covered by W822/W829 and endNewGameBtn).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted win-after-one-move fixture. Reducer increments `moves`; isTerminal
// returns a positive-score payload once `moves >= 1`, so a single dispatch
// drives PlayPage into the terminal-win branch that mounts the end-actions
// row containing `new-game-btn`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "new-game-btn-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "New Game Btn Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for new-game-btn play-again-btn--big class.",
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

describe("PlayPage win-banner new-game-btn play-again-btn--big class (W1439)", () => {
  it("carries the play-again-btn--big size modifier class on the primary end-actions CTA", async () => {
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
    // new-game-btn child) mounts.
    fireEvent.click(screen.getByTestId("fx-win"));

    const newGameBtn = screen.getByTestId("new-game-btn");

    // Lock the contract: new-game-btn's classList must include the literal
    // `play-again-btn--big` size modifier. Dropping/renaming that token
    // would shrink the primary CTA to share-pill size while every label,
    // click, autofocus, and structural sibling test stayed green.
    expect(newGameBtn.classList.contains("play-again-btn--big")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
