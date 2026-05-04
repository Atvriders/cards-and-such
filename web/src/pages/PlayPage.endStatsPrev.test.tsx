/**
 * Unit test for the PlayPage win-banner end-stats-prev "(was MM:SS)" sub-span (W842).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2708) wraps the previous-best readout in a nested
 *   conditional:
 *     {isNewRecord && (
 *       <span className="end-stats-record" data-testid="end-stats-record">
 *         New record!
 *         {previousBest != null && (
 *           <span className="end-stats-prev"> (was {formatTime(previousBest)})</span>
 *         )}
 *       </span>
 *     )}
 *   The inner `previousBest != null` guard distinguishes a *first-time win*
 *   (no stored PR yet, `previousBest === null`) from a *PR-beating win* (an
 *   older PR existed and we just beat it). On a first-time win the "New
 *   record!" badge SHOULD still render — but the "(was MM:SS)" appendix
 *   must NOT, because there is nothing to be "was" about.
 *
 *   W816 covers the positive branch (badge + "(was 00:10)" sub-span when a
 *   slower stored PR existed) and the isNewRecord=false branch (badge
 *   absent). Neither test isolates this third leg: badge present, sub-span
 *   absent. A regression that always rendered "(was —)" / "(was 00:00)"
 *   on a first-time win would slip through every adjacent test.
 *
 * Strategy:
 *   Mirror the W816 hoisted fixture so a single dispatcher click drives
 *   PlayPage to terminal-win. Crucially, do NOT pre-seed `cards-best-times`
 *   — `readBestTime(plugin.id)` returns null inside `recordBest`, which
 *   makes `prev=null, isRecord=true` and the end-effect calls
 *   `setPreviousBest(null)`. After the win we assert the badge node *is*
 *   mounted (isNewRecord=true, the same conditional that gates W816's
 *   positive case) and that the inner `.end-stats-prev` span is NOT in
 *   the DOM — pinning the `previousBest != null` guard contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as W816's so a single dispatcher click
// drives PlayPage into terminal-win and the end-stats Best row mounts.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-prev-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Prev Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner end-stats-prev test.",
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

// PlayPage looks up the plugin via the games registry — substitute the
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

describe("PlayPage win-banner end-stats-prev sub-span (W842)", () => {
  it("does NOT render the '(was MM:SS)' appendix on a first-time win when no previous best exists", async () => {
    // Critical setup: do NOT seed `cards-best-times`. With no stored PR
    // for this plugin id, `readBestTime` returns null inside `recordBest`,
    // so `prev=null, isRecord=true` — the end-effect then calls
    // `setPreviousBest(null)`, which is exactly the state that the
    // `previousBest != null` inner guard must collapse.
    const ELAPSED_SECONDS = 5;

    // Install fake timers BEFORE mount per the W809/W814/W816 pattern so
    // the 1Hz `setInterval` driving `elapsed` arms against the virtual
    // clock from mount. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks alive so quickstart can transition phase to "playing".
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

    // Pre-condition: badge is NOT mounted before the game ends — it
    // lives inside the `phase === "ended" && isWin && isNewRecord` JSX.
    expect(screen.queryByTestId("end-stats-record")).toBeNull();

    // Accrue some elapsed time so the win path has a real number to
    // pass to `recordBest` — value irrelevant since there's no PR to
    // beat, but a non-zero elapsed avoids the degenerate 00:00 case.
    act(() => {
      vi.advanceTimersByTime(ELAPSED_SECONDS * 1000);
    });

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, the
    // PlayPage end-effect transitions phase to "ended" with isWin=true,
    // and `recordBest(elapsed)` returns prev=null/isRecord=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity #1: the win-banner Best row IS mounted (otherwise the
    // negative assertion below would pass for the wrong reason — i.e.,
    // because the entire end-panel never rendered).
    expect(screen.getByTestId("end-stats-best")).toBeTruthy();

    // Sanity #2: badge IS present — first-time win still flips
    // isNewRecord=true, so the outer conditional must mount the
    // "New record!" copy. This distinguishes our test from the W816
    // negative branch (isNewRecord=false / badge absent).
    const recordBadge = screen.getByTestId("end-stats-record");
    expect(recordBadge).toBeTruthy();
    expect(recordBadge.textContent).toContain("New record!");

    // The actual contract under test: the inner `.end-stats-prev` span
    // must NOT be rendered. `previousBest === null` collapses the
    // `previousBest != null && (...)` guard, so neither the className
    // nor the "(was" text fragment should appear in the badge subtree.
    expect(
      recordBadge.querySelector(".end-stats-prev"),
    ).toBeNull();
    expect(recordBadge.textContent).not.toContain("(was");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
