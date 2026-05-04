/**
 * Unit test for PlayPage win-banner auto-focus (W829).
 *
 * Observable behavior:
 *   When a round reaches a terminal-win state and the win banner mounts,
 *   the "New game" button (`data-testid="new-game-btn"`) is rendered with
 *   the React `autoFocus` prop tied to `showWinBanner`. The user-visible
 *   effect is that, after winning, pressing Enter immediately starts a
 *   fresh round with no extra Tab — the win-banner-hint paragraph
 *   ("Press Enter to play again, Esc to dismiss") relies on this focus
 *   landing on the new-game button rather than on body.
 *
 *   PlayPage.endNewGameBtn.test.tsx verifies the click handler swaps to a
 *   new round, and PlayPage.winBannerScore/Text tests cover the banner
 *   contents, but no existing test asserts that focus lands on the
 *   new-game button when the banner mounts. A regression that drops the
 *   `autoFocus` (or moves it to a sibling like the share/back button)
 *   would silently break the keyboard-only flow without flipping any
 *   other assertion.
 *
 * Strategy:
 *   Reuse the same `vi.hoisted` win-after-one-move fixture as the sibling
 *   replay-save tests so a single dispatch drops PlayPage straight into
 *   the terminal-win branch that renders `end-actions`. After the
 *   terminal click, read `document.activeElement` and assert it is the
 *   `new-game-btn` node — the only contract that survives any stylistic
 *   refactor of the surrounding markup.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage into the terminal-win branch
// that mounts the end-actions row containing `new-game-btn`. Same shape
// as the sibling replay-save tests so any future fixture-level tweak
// there is easy to mirror here.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-autofocus-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner Auto-Focus Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner autoFocus assertion.",
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
// terminal-win render side-effect-free, mirroring the sibling tests.
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

describe("PlayPage win-banner auto-focuses the new-game button (W829)", () => {
  it("places document focus on new-game-btn when the win banner mounts", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // The autoFocus prop runs when the element first mounts; React-DOM
    // expects the host container to be in document.body so focus() can
    // succeed under jsdom. `render` from @testing-library/react attaches
    // its container to document.body by default, which is sufficient.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round into terminal-win so end-actions (and thus the
    // new-game button with autoFocus={showWinBanner}) mount. Quickstart
    // skips the setup screen, so this is the only click required.
    fireEvent.click(screen.getByTestId("fx-win"));

    const newGameBtn = screen.getByTestId("new-game-btn");
    // The autoFocus lands on this exact node. Reading activeElement is
    // the only way to observe `autoFocus` from JSX in jsdom — the prop
    // does not survive into the rendered DOM as an attribute.
    expect(document.activeElement).toBe(newGameBtn);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
