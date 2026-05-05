/**
 * Unit test for the PlayPage end-banner end-stats <dt> count (W1976).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2695-2716)
 *   renders a `<dl class="end-stats">` definition list containing exactly
 *   two label/value rows: the unconditional time row (`<dt>{t("hud.time")}</dt>`
 *   + `<dd data-testid="end-stats-time">…</dd>`) and the `{isWin && …}`-gated
 *   personal-best row (`<dt>{t("hud.best")}</dt>` +
 *   `<dd data-testid="end-stats-best">…</dd>`). On a winning round the
 *   total `<dt>` count inside the dl is therefore exactly 2.
 *
 *   Sibling W1095 (endStatsRowStructural) pins the .end-stats-row wrapper
 *   class and asserts each row contains *some* dt via per-row
 *   `row.querySelector("dt")` truthiness, plus a row-count check of
 *   `>= 2` rows. Sibling W1398 (PlayPageEndStatsTimeDtTag) pins the
 *   *time* row's first child as tagName "DT". Sibling W1384
 *   (PlayPageEndStatsBestTag) pins the *best* dd's tagName.
 *
 *   No existing test pins the literal *dt count* across the whole
 *   `.end-stats` <dl> via `querySelectorAll("dt")`. A regression that
 *   accidentally rendered a third dt (e.g. an extra "moves" or "hints"
 *   row that wasn't intended on this branch), or that collapsed the
 *   `{isWin && …}`-gated best row into a dt-less form (e.g. swapped
 *   `<dt>` for `<span>` while keeping the row wrapper), would slip
 *   past every per-row truthiness check while still producing valid
 *   HTML. This test fills that gap with a single querySelectorAll
 *   length assertion against the dl.
 *
 * Strategy mirrors W1384 / W1398 (hoisted-fixture pattern with WIN-fixture):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — drives PlayPage
 *     into terminal-win where `isWin === true` and BOTH the time row
 *     and the `{isWin && …}`-gated best row mount.
 *   - Mount at `/play/:gameId?seed=1&quickstart=1` to skip setup.
 *   - Click the fixture's win button, locate the `.end-stats` dl, and
 *     assert `dl.querySelectorAll("dt").length === 2`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-dt-count-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Dt Count Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats dt count test.",
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

describe("PlayPage end-banner end-stats dt count (W1976)", () => {
  it("renders exactly two <dt> labels in the .end-stats <dl> on a winning round", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win. One click → reducer (moves: 0 → 1),
    // isTerminal returns a positive-score payload (isWin=true), PlayPage
    // transitions phase to "ended" and BOTH the time row and the
    // `{isWin && …}`-gated best-time row mount.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity-check the win branch — guards the dt count assertion below
    // from passing for the wrong reason if the terminal transition broke.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("true");

    // Anchor on the .end-stats <dl> so the dt count is scoped to the
    // stats block, not unrelated dt elements that may live elsewhere
    // on the page (none today, but defensive).
    const endStats = container.querySelector(".end-stats");
    expect(endStats).not.toBeNull();
    expect(endStats?.tagName).toBe("DL");

    // Pin the literal dt count: time row dt + best row dt = 2.
    const dts = endStats!.querySelectorAll("dt");
    expect(dts.length).toBe(2);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
