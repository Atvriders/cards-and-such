/**
 * Unit test for the PlayPage win-banner end-stats-record badge className
 * and tagName (W1425).
 *
 * Observable behavior:
 *   When the just-finished round beats the stored personal best, PlayPage.tsx
 *   (~line 2706) renders the new-record badge as
 *     `<span className="end-stats-record" data-testid="end-stats-record">…</span>`
 *   inside the win-banner end-stats `Best` row. Sibling tests (W816,
 *   end-stats-record badge text + conditional render; W842, the
 *   `end-stats-prev` sub-span) only locate the badge by `data-testid` and
 *   pin its visible text — they never assert the literal `end-stats-record`
 *   className on the badge itself, nor that the badge is a `<span>`. A
 *   regression that swapped the wrapper to a `<div>` (changing inline-flow)
 *   or renamed the className (breaking the CSS selector that styles it as
 *   a record badge) would slip past every adjacent test because the
 *   `data-testid`, the visible "New record!" copy, and the inner
 *   `end-stats-prev` sub-span would all keep working.
 *
 * Strategy:
 *   Mirror the W816 hoisted fixture so a single dispatcher click drives
 *   PlayPage to terminal-win. Pre-seed `cards-best-times` with a *larger*
 *   stored time than the round's elapsed time so `recordBest(elapsed)`
 *   returns isRecord=true and the badge mounts. Locate the badge by
 *   `data-testid` (the contract we already pin elsewhere) and assert two
 *   distinct DOM properties on it: the literal `tagName === "SPAN"` and
 *   the literal `className === "end-stats-record"` (exact match, not
 *   `toContain`, so a stray modifier class added later would surface as
 *   a failure rather than silently passing).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture mirrors the W816 setup: reducer increments `moves`,
// isTerminal returns a winning payload once moves >= 1, so a single
// dispatcher click drives PlayPage into the terminal-win branch (the only
// branch that mounts the end-stats record badge we assert on).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-banner-record-badge-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Banner Record Badge Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the end-banner end-stats-record className test.",
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

describe("PlayPage end-banner end-stats-record badge className (W1425)", () => {
  it('exposes tagName "SPAN" and className "end-stats-record" on the new-record badge', async () => {
    // Pre-seed a *slow* stored best (10s) BEFORE PlayPage mounts. Our
    // fast 5s round will beat it, so `recordBest(5)` returns
    // isRecord=true and the badge renders. Map shape mirrors the writer
    // in PlayPage.tsx (writeBestTime): single `cards-best-times` key
    // holding `Record<gameId, seconds>`.
    const STORED_BEST_SECONDS = 10;
    const ELAPSED_SECONDS = 5;
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ [hoisted.TEST_GAME_ID]: STORED_BEST_SECONDS }),
    );

    // Install fake timers BEFORE mount so the 1Hz `setInterval` that
    // drives `elapsed` registers against the virtual clock from the
    // start. `shouldAdvanceTime: true` keeps mount-phase microtasks
    // alive so the quickstart effect can transition `phase` to
    // "playing" normally.
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

    // Pre-condition: the badge is NOT mounted before the game ends — it
    // lives inside the `phase === "ended" && isWin && isNewRecord` branch.
    // Without this guard, an accidental always-mount regression could
    // pass the post-win assertions for the wrong reason.
    expect(screen.queryByTestId("end-stats-record")).toBeNull();

    // Advance the virtual clock to 5s of elapsed play. 5s < the seeded
    // 10s, so `recordBest(5)` returns isRecord=true and `isNewRecord`
    // flips on — the exact path that mounts the badge.
    act(() => {
      vi.advanceTimersByTime(ELAPSED_SECONDS * 1000);
    });

    // Drive the round to terminal-win. One click increments moves
    // (0 -> 1), `isTerminal` returns a winning payload, and the
    // end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // The badge MUST be mounted post-win — otherwise the className /
    // tagName checks below would throw on null and the failure mode
    // would be confusing. Locate via data-testid (the contract pinned
    // by W816) so this test isolates exactly the new-record badge node
    // from any other element on the page.
    const recordBadge = screen.getByTestId("end-stats-record");
    expect(recordBadge).toBeTruthy();

    // Contract under test #1: the badge must be a <span>. PlayPage
    // renders it inline so the trailing `(was MM:SS)` sub-span flows
    // alongside the "New record!" copy on the same line. A regression
    // swapping it to a <div> would break that inline layout silently
    // (visible text + data-testid both unchanged).
    expect(recordBadge.tagName).toBe("SPAN");

    // Contract under test #2: the badge must carry the literal
    // `end-stats-record` className — exact match (not `toContain` /
    // `toMatch`), so a regression that added a stray modifier class
    // (e.g., `end-stats-record end-stats-record--celebrate`) without
    // updating the CSS selector would surface here.
    expect(recordBadge.className).toBe("end-stats-record");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
