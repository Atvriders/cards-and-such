/**
 * Unit test for the PlayPage end-banner heading className (W1292).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2666)
 *   renders the headline as `<h2 className="win-banner-title">You won!</h2>`
 *   directly inside the win-banner wrapper. Sibling tests cover:
 *     - W801: the headline TEXT ("You won!") and its role/level
 *     - W1242: the wrapper DIV's className ("win-banner-headline")
 *   Neither asserts the `win-banner-title` className on the <h2> itself.
 *   That class is the CSS hook (PlayPage.css ~line 904) that drives the
 *   headline's typography — colour, weight, size, gradient. A regression
 *   that renamed the class while keeping the tag/text intact would silently
 *   strip the celebratory styling without breaking any current PlayPage
 *   test.
 *
 * Strategy:
 *   Mirror the hoisted fixture pattern from W1242 (PlayPageEndBannerClassName
 *   .test.tsx): a one-action plugin whose reducer increments `moves` and
 *   whose `isTerminal` returns a winning payload after a single dispatch.
 *   Use `?quickstart=1` so PlayPage skips the setup screen. After the win
 *   dispatch, locate the heading via role+level+name and assert the literal
 *   `win-banner-title` className on it (exact match, not contains, so a
 *   rename that kept any prefix/suffix still trips this assertion).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-banner-heading-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Banner Heading Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner heading className test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 1 } : null,
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage end-banner heading className (W1292)", () => {
  it('exposes the "win-banner-title" className on the <h2> headline', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: heading is NOT mounted before the round ends.
    expect(
      screen.queryByRole("heading", { level: 2, name: "You won!" }),
    ).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // The headline is the <h2> with name "You won!". Locate via role+level+
    // name (so this isolates the win-banner heading from any other <h2> on
    // the page) and assert the literal className. Exact-match guards
    // against rename regressions that keep the tag and text intact.
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "You won!",
    });
    expect(heading.className).toBe("win-banner-title");
  });
});

void React;
