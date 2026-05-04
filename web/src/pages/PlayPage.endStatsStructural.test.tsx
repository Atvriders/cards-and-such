/**
 * Structural test for the PlayPage `.end-stats` wrapper class (W1099).
 *
 * Observable behavior:
 *   When the round reaches a terminal-win, PlayPage.tsx (~line 2695)
 *   renders a `<dl className="end-stats" data-testid="end-stats">`
 *   inside the `[data-testid="end-panel"]` section. The list wraps the
 *   per-row stats — time (`end-stats-time`), best (`end-stats-best`),
 *   and the new-record badge (`end-stats-record`) — laid out as paired
 *   `<dt>`/`<dd>` rows under `.end-stats-row`. The `.end-stats` class
 *   anchors the definition-list typography, row spacing, and dt/dd
 *   alignment in PlayPage.css. A rename or removal would silently
 *   strip the stats block's layout while the existing per-cell tests
 *   (W endStatsTime/Best/Record/Prev), which key off testids on the
 *   inner `<dd>`/`<span>` nodes, continued to pass.
 *
 *   Sibling tests pin each cell's *content* (W endStatsTime pins the
 *   formatted elapsed time, W endStatsBest pins the best-time value,
 *   etc.) but no existing test pins the `.end-stats` wrapper class
 *   itself — an exhaustive grep across the test suite turned up only
 *   doc-comment mentions, never a `classList.contains("end-stats")`
 *   or `querySelector(".end-stats")` assertion. This test fills that
 *   gap with the minimum surface: drive the round to terminal-win,
 *   locate the wrapper by its CSS class, and pin both the class
 *   itself and the structural invariant that the time/best/record
 *   stats live inside it.
 *
 * Strategy mirrors W1080 (PlayPage.endActionsStructural.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — enough to
 *     drive PlayPage into the terminal-win branch where the end-panel
 *     and its `.end-stats` block mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, then locate `.end-stats` via
 *     querySelector and assert (a) the class is present, (b) it
 *     lives inside the end-panel, and (c) it contains the time and
 *     best stat cells.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-structural-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Structural Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-stats structural test.",
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
  vi.restoreAllMocks();
});

describe("PlayPage .end-stats wrapper (W1099)", () => {
  it("renders an .end-stats wrapper inside the end-panel containing the time and best stat cells", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the end-panel (and therefore .end-stats) is not
    // mounted before the round terminates — both live behind the
    // `phase === "ended" && finalScore !== null` render gate.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(container.querySelector(".end-stats")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel).toBeTruthy();

    const endStats = container.querySelector(".end-stats");

    // Pin existence — a rename here detaches every .end-stats rule in
    // PlayPage.css (definition-list typography, row spacing, dt/dd
    // alignment).
    expect(endStats).not.toBeNull();
    // Pin the bare class — CSS rules key off the exact selector.
    expect(endStats?.classList.contains("end-stats")).toBe(true);
    // Pin the structural relationship: .end-stats is a descendant of
    // the end-panel section. A regression that hoisted it out of the
    // panel would break the contained layout context the CSS assumes.
    expect(endPanel.contains(endStats as Node)).toBe(true);
    // Pin the load-bearing children: the time and best stat cells.
    // Sibling tests pin each cell's content by testid; this assertion
    // pins the *grouping* — i.e. that they share the wrapper.
    expect(endStats?.querySelector('[data-testid="end-stats-time"]')).not.toBeNull();
    expect(endStats?.querySelector('[data-testid="end-stats-best"]')).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
