/**
 * Unit test for the PlayPage win-banner wrapper className (W1242).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2664)
 *   renders the win-banner wrapper as
 *   `<div data-testid="win-banner" className="win-banner-headline">…</div>`.
 *   Sibling tests already cover the headline text "You won!" (W801), the end
 *   panel's data-win attribute (W811), and various button rows inside the
 *   banner — but no test asserts the wrapper's `win-banner-headline` class
 *   itself, even though that class is the primary CSS hook that drives the
 *   banner's emoji animation, layout, and (via descendant selectors in
 *   PlayPage.css ~line 921 `.win-banner-emoji`) the celebratory styling
 *   around the headline. A regression that dropped or renamed the className
 *   on the wrapper would silently break the win presentation — every
 *   adjacent functional test (text, score, buttons) would still pass.
 *
 * Strategy:
 *   Mirror the hoisted fixture pattern from W814 (PlayPage.endStatsBest.test
 *   .tsx): a one-action plugin whose reducer increments `moves` and whose
 *   `isTerminal` returns a winning payload after a single dispatch. Install
 *   fake timers with `shouldAdvanceTime: true` BEFORE mount per the
 *   W639/W647 pattern so the 1Hz elapsed-counter effect arms cleanly. Use
 *   `?quickstart=1` so PlayPage skips the setup screen and mounts the
 *   fixture's dispatch button immediately. One click drives PlayPage into
 *   terminal-win, and we then assert the wrapper exposes the literal
 *   `win-banner-headline` class — exact-match (not contains) so that a
 *   regression which renamed the class but kept the testid would still
 *   surface.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; `isTerminal` returns a winning
// payload once `moves >= 1`, so a single dispatch from the fixture button
// drives PlayPage into the terminal-win branch and renders the win banner.
// The score value itself is irrelevant here — we only care that the win
// branch (rather than the loss branch) of the JSX renders, since that's the
// branch which carries the `win-banner-headline` className we assert on.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-banner-classname-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Banner ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner wrapper className test.",
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage win-banner wrapper className (W1242)", () => {
  it('exposes the "win-banner-headline" className on the win-banner element', async () => {
    // Install fake timers BEFORE mount per W639/W647 pattern so the 1Hz
    // `setInterval` that drives `elapsed` registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks alive so the quickstart effect can transition `phase`
    // to "playing" normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the win-banner wrapper is NOT mounted before the
    // game ends — it lives inside the `phase === "ended" && isWin`
    // branch of the JSX. Asserting absence first guards against false
    // positives if the testid ever leaked into the setup screen.
    expect(screen.queryByTestId("win-banner")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // The whole point of the test: the wrapper carries the literal
    // `win-banner-headline` className. Exact match (not `.contains`) so
    // that a regression which appended or replaced the class — e.g.
    // renaming to `win-banner__headline` — would still trip this
    // assertion even if the testid is preserved.
    const banner = screen.getByTestId("win-banner");
    expect(banner.className).toBe("win-banner-headline");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
