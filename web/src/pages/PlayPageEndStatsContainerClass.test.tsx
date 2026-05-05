/**
 * Unit test for the PlayPage win-banner end-stats `<dl>` container's
 * exact `className` (W1907).
 *
 * Observable behavior:
 *   When the round terminates, PlayPage.tsx (~line 2695) renders the
 *   end-stats block as
 *     `<dl className="end-stats" data-testid="end-stats">…</dl>`
 *   inside the `[data-testid="end-panel"]` section. The `.end-stats`
 *   class anchors the definition-list typography, row spacing, and
 *   dt/dd alignment defined in PlayPage.css. Sibling tests pin the
 *   class via `classList.contains("end-stats")` (W1099,
 *   PlayPage.endStatsStructural.test.tsx) and pin per-cell content by
 *   testid (W endStatsTime/Best/Record/Prev), but no test asserts the
 *   *exact* `className` string on the wrapper itself. A regression that
 *   added a stray modifier class (e.g.
 *   `end-stats end-stats--banner`) without updating the matching CSS
 *   selector would silently slip past every adjacent test because
 *   `classList.contains("end-stats")` would still return true and the
 *   data-testid would still resolve.
 *
 * Strategy mirrors W1425 (PlayPageEndBannerRecordBadgeClass.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — drives PlayPage
 *     into the terminal-win branch where the end-panel and its
 *     `.end-stats` `<dl>` mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, locate the wrapper via
 *     `data-testid="end-stats"` (the contract pinned by sibling tests),
 *     and assert `className === "end-stats"` — exact match, not
 *     `toContain` / `classList.contains`, so a stray modifier class
 *     would surface as a failure rather than silently passing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-container-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Container Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the end-stats container className test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 42 } : null,
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
  vi.restoreAllMocks();
});

describe("PlayPage end-stats container className (W1907)", () => {
  it('exposes className "end-stats" exactly on the end-stats <dl> wrapper', async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the wrapper is NOT mounted before the round
    // terminates — it lives behind the
    // `phase === "ended" && finalScore !== null` render gate. Without
    // this guard, an accidental always-mount regression could pass the
    // post-win assertion for the wrong reason.
    expect(screen.queryByTestId("end-stats")).toBeNull();

    // Drive the round to terminal-win. One click increments moves
    // (0 -> 1), `isTerminal` returns a winning payload, and the
    // end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Locate via data-testid (the contract pinned elsewhere) so this
    // test isolates exactly the end-stats wrapper node.
    const endStats = screen.getByTestId("end-stats");
    expect(endStats).toBeTruthy();

    // Contract under test: the wrapper must carry the literal
    // `end-stats` className — exact match (not `toContain` /
    // `classList.contains`), so a regression that added a stray
    // modifier class (e.g., `end-stats end-stats--banner`) without
    // updating the CSS selector would surface here.
    expect(endStats.className).toBe("end-stats");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
