/**
 * Unit test for the win-banner new-game-btn (the end-actions "continue" /
 * play-again primary CTA) `className` exact-string contract.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2721-2728) renders the end-actions row's primary
 *   "play again" / continue CTA as
 *     <button
 *       onClick={newGame}
 *       className="play-again-btn play-again-btn--big"
 *       data-testid="new-game-btn"
 *       autoFocus={showWinBanner}
 *     >
 *   The exact-literal className "play-again-btn play-again-btn--big" — both
 *   tokens, in that order, with single-space separation, no other tokens —
 *   is what the stylesheet rule chain expects to size the primary CTA as
 *   the dominant pill on the end-panel. Any extra token (e.g. an accidental
 *   `play-replay-btn` collapse from sibling replay-btn, a stray
 *   `play-share-pill` mix-in, or a debug token leak) would change the
 *   computed style cascade even if the two existing tokens are still
 *   present.
 *
 *   Sibling tests pin *individual tokens* on this same button:
 *     - PlayPageEndBannerNewGameBtnBase.test.tsx — `play-again-btn` block
 *       token via classList.contains (W1442)
 *     - PlayPageEndBannerNewGameBtnClass.test.tsx — `play-again-btn--big`
 *       size modifier via classList.contains (W1439)
 *   Both use `classList.contains`, so each only proves its single token is
 *   *present*; neither asserts the literal full className string. A
 *   regression that *added* a third token (e.g. className becoming
 *   "play-again-btn play-again-btn--big play-replay-btn", visually merging
 *   the primary CTA with the replay-btn accent) would leave both
 *   classList.contains tests green while breaking the intended pill style.
 *
 * Strategy:
 *   - Reuse the win-after-one-move hoisted fixture pattern from sibling
 *     PlayPageEndBannerNewGameBtnBase / NewGameBtnClass tests so a single
 *     dispatch drives PlayPage into the terminal-win branch that mounts
 *     the end-actions row.
 *   - Assert `newGameBtn.className === "play-again-btn play-again-btn--big"`
 *     (literal triple-equals string equality). This is a stricter contract
 *     than the sibling `classList.contains` checks: it catches added tokens,
 *     reordering, double spaces, and trailing whitespace — none of which
 *     are caught by the existing sibling tests.
 *   - No click on the button itself: this is a static-mount className
 *     contract, not a behavior pin (click behavior is covered by
 *     PlayPage.endNewGameBtn).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted win-after-one-move fixture. Reducer increments `moves`; isTerminal
// returns a positive-score payload once `moves >= 1`, so a single dispatch
// drives PlayPage into the terminal-win branch that mounts the end-actions
// row containing `new-game-btn` (the continue / play-again CTA).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "continue-btn-classname-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Continue Btn ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for new-game-btn className exact-equality.",
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

describe("PlayPage end-banner continue (new-game-btn) className exact equality", () => {
  it("renders the primary continue CTA with className exactly 'play-again-btn play-again-btn--big'", async () => {
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
    // primary continue / new-game-btn child) mounts.
    fireEvent.click(screen.getByTestId("fx-win"));

    const newGameBtn = screen.getByTestId("new-game-btn");

    // Lock the full literal className string. Stricter than sibling
    // classList.contains checks (W1442 / W1439) — this catches added
    // tokens, token reordering, and whitespace drift that would change
    // the cascade while leaving each individual classList.contains test
    // green.
    expect(newGameBtn.className).toBe("play-again-btn play-again-btn--big");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
