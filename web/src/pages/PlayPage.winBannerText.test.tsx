/**
 * Unit test for the PlayPage win-banner headline text (W801).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state (positive score) and the
 *   user has not yet dismissed the banner, PlayPage.tsx (~line 2664) renders
 *   a `<div data-testid="win-banner" className="win-banner-headline">`
 *   containing the literal heading `"You won!"`. That headline is the
 *   primary signal to the player that they've won — sibling tests cover the
 *   `game.win` analytics breadcrumb (W787), the share/print row inside the
 *   banner (W557), the save-replay button (W729), and confetti state
 *   plumbing, but no test asserts the actual congratulatory headline text.
 *   A regression that swapped the literal for an i18n key, dropped the
 *   heading, or rendered it only when `bannerDismissed === true` would
 *   silently strip the player's winning feedback while every existing
 *   PlayPage test continued to pass.
 *
 * Strategy:
 *   Mirror the hoisted fixture pattern from PlayPage.share.test.tsx — a
 *   minimal plugin whose reducer flips a `won` flag on a `WIN` action and
 *   whose `isTerminal` reports a positive score once that flag is set.
 *   Click `start-game` → `fixture-win` so PlayPage reaches `phase ===
 *   "ended"` with `finalScore > 0` and the win banner mounts. Then assert
 *   both the testid container *and* the heading text, so a regression that
 *   keeps the wrapper but strips the message (or vice-versa) still fails.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. Single dispatched action drives PlayPage to
// `phase === "ended"` with a positive `finalScore`, which is the precise
// state under which the win banner — and the "You won!" headline this
// test asserts — is rendered.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-text-fixture";
  type State = { won: boolean };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner Text Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner headline text test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: { type: string }): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: 1 } : null),
    component: ({ dispatch }: { dispatch: (a: { type: string }) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-win"
          onClick={() => dispatch({ type: "WIN" })}
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

// Confetti pulls in canvas APIs that jsdom doesn't implement; stubbing it
// keeps the win-banner render fast and side-effect-free.
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

describe("PlayPage win-banner headline text (W801)", () => {
  it('renders "You won!" inside the win-banner container on a winning terminal', async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the fixture's dispatch button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the reducer into the winning terminal state. The dispatch
    // path in PlayPage.tsx detects `isTerminal().score > 0`, transitions
    // `phase` to `"ended"`, and renders the win banner.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-win"));
    });

    // Assert the wrapper exists. A regression that drops the data-testid
    // (e.g. a refactor that splits the headline into a sub-component
    // without re-attaching the testid) would surface here even if the
    // visible text remained unchanged.
    const banner = screen.getByTestId("win-banner");
    expect(banner).toBeTruthy();

    // Assert the literal congratulatory headline. The text lives inside an
    // <h2 className="win-banner-title"> directly under the banner wrapper,
    // so scoping `getByText` to the banner ensures we don't accidentally
    // match a stray "You won!" elsewhere on the page (there is none today,
    // but the scoping makes the assertion future-proof).
    const headline = screen.getByRole("heading", { level: 2, name: "You won!" });
    expect(headline).toBeTruthy();
    expect(banner.contains(headline)).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
