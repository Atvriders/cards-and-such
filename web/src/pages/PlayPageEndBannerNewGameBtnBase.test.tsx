/**
 * Unit test for the win-banner new-game-btn `play-again-btn` base class
 * token (W1442).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2721-2728) renders the end-actions row's primary
 *   "New game" CTA as a `<button data-testid="new-game-btn">` with the
 *   className `play-again-btn play-again-btn--big`. The `play-again-btn`
 *   *base* token (the BEM block, not the `--big` size modifier) is the
 *   shared pill-shape hook the stylesheet uses for both end-action CTAs —
 *   without it, the button loses its rounded-pill base styling (background,
 *   border, padding, hover affordance) and falls back to the user-agent
 *   button look, even if the `--big` size modifier is still present.
 *
 *   Sibling tests pin *other* attrs in this same end-actions cluster:
 *     - PlayPageEndBannerNewGameBtnClass.test.tsx — `play-again-btn--big`
 *       size modifier on new-game-btn (W1439)
 *     - PlayPageEndBannerReplayBtnClass.test.tsx — `play-replay-btn` accent
 *       modifier on replay-btn (W1436)
 *     - PlayPage.endNewGameBtn.test.tsx          — new-game-btn click action
 *     - PlayPage.winBannerAutoFocus.test.tsx     — new-game autofocus on win
 *     - PlayPage.endActionsStructural.test.tsx   — both buttons mount in row
 *   None of them lock the literal `play-again-btn` *base* (block) token on
 *   new-game-btn. A regression that dropped only the base token (e.g.
 *   collapsing className to just `play-again-btn--big`, or renaming the
 *   block to `pill-btn play-again-btn--big`) would orphan the size modifier
 *   from its block and strip the pill-shape base styling while every click,
 *   autofocus, label, structural, and `--big` sibling test stayed green.
 *
 * Strategy:
 *   - Reuse the win-after-one-move hoisted fixture pattern from
 *     PlayPageEndBannerNewGameBtnClass so a single dispatch drives PlayPage
 *     into the terminal-win branch that mounts the end-actions row.
 *   - Assert new-game-btn's `classList` contains the literal
 *     `play-again-btn` token. Using `classList.contains` (not a substring
 *     match) guards against a false-positive where the `play-again-btn--big`
 *     modifier's substring would otherwise pass a naive `className.includes`
 *     check.
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
  const TEST_GAME_ID = "new-game-btn-base-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "New Game Btn Base Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for new-game-btn play-again-btn base class.",
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

describe("PlayPage win-banner new-game-btn play-again-btn base class (W1442)", () => {
  it("carries the play-again-btn base (block) class token on the primary end-actions CTA", async () => {
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
    // `play-again-btn` *base* (block) token. Dropping that token (while
    // keeping `--big`) would orphan the size modifier from its block and
    // strip the pill-shape base styling while every label, click, autofocus,
    // structural, and `--big` sibling test stayed green.
    expect(newGameBtn.classList.contains("play-again-btn")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
