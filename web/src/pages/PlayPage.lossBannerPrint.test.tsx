/**
 * Unit test for the PlayPage end-banner Print button on the LOSS path (W882).
 *
 * Observable behavior:
 *   The end-share-row (PlayPage.tsx ~line 2746) renders unconditionally for
 *   any terminal phase, and the `play-print-btn` inside it is NOT gated on
 *   `isWin` — only the `play-save-replay` sibling carries the win-only
 *   guard. The `printScoresheet` callback (PlayPage.tsx ~line 1433) calls
 *   `window.print()` and emits `track("play.print", { gameId })`.
 *
 *   W778 (PlayPage.share.test.tsx) pinned the WIN-path Print button. No
 *   test currently pins the LOSS-path equivalent. A regression that wrapped
 *   the Print button in an `isWin` gate, dropped the click handler on
 *   loss, or stopped emitting the `play.print` breadcrumb on the loss path
 *   would silently break print-on-defeat while every existing share-row
 *   test continued to pass.
 *
 * Strategy mirrors W778's win-path Print test, but with W845's
 * `isTerminal: { score: 0 }` loss fixture so PlayPage walks the
 * `isLoss === true` branch instead of the win branch. Stub `window.print`
 * with a vi.fn(), drive to a zero-score terminal, click `play-print-btn`,
 * and assert exactly one `play.print` event AND `window.print` called once.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — mirrors W845. Reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action. `isTerminal` returning a
// zero-score payload is the canonical "loss" discriminator (PlayPage.tsx
// ~line 1389: `isLoss = phase === "ended" && finalScore !== null && !isWin`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-print-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Print Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner Print button test.",
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

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal render fast and side-effect-free. (The loss path doesn't
// trigger confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss-banner Print button (W882)", () => {
  it("clicking play-print-btn after a loss calls window.print() once and tracks one play.print event", async () => {
    // jsdom doesn't implement window.print — assign a vi.fn() directly so
    // the printScoresheet callback's `typeof window.print === "function"`
    // guard passes and the call is observable.
    const printSpy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).print = printSpy;

    const { default: PlayPage } = await import("./PlayPage.js");
    const { getEvents, clearEvents } = await import(
      "../platform/analytics.js"
    );

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity-check the loss branch is the one driving render — guards
    // against a fixture mis-wire that accidentally produced a positive
    // score and made this test trivially pass on the win path (which W778
    // already covers).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-on-loss assertion: the Print button must be mounted on
    // the loss path. (Per W866/W871, the share-row is shared between win
    // and loss; only `play-save-replay` is win-gated.)
    const printBtn = screen.getByTestId("play-print-btn");
    expect(printBtn).toBeTruthy();

    // Clear the analytics ring right before the click so the count
    // assertion below is unambiguously about the print handler — not the
    // prior app.boot / route.change / game.start / game.lose breadcrumbs.
    clearEvents();

    act(() => {
      fireEvent.click(printBtn);
    });

    // Pin the contract: window.print invoked exactly once and exactly one
    // `play.print` analytics event recorded with the fixture's gameId.
    expect(printSpy).toHaveBeenCalledTimes(1);

    const printEvts = getEvents().filter((e) => e.name === "play.print");
    expect(printEvts.length).toBe(1);
    const props = printEvts[0]?.props as { gameId: string } | undefined;
    expect(props?.gameId).toBe(hoisted.TEST_GAME_ID);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
