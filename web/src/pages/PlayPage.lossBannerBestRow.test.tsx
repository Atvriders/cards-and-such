/**
 * Unit test for PlayPage loss-banner best-time row absence (W867).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2700-2715) wraps the entire `end-stats-best` row
 *   — i.e. the `<dt>Best</dt><dd data-testid="end-stats-best">…</dd>`
 *   pair *and* its inner `end-stats-record` "New record!" badge — in a
 *   single `{isWin && (…)}` guard:
 *
 *     <dl className="end-stats" data-testid="end-stats">
 *       <div className="end-stats-row">
 *         <dt>{t("hud.time")}</dt>
 *         <dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>
 *       </div>
 *       {isWin && (
 *         <div className="end-stats-row">
 *           <dt>{t("hud.best")}</dt>
 *           <dd data-testid="end-stats-best">
 *             {bestTime != null ? formatTime(bestTime) : "—"}
 *             {isNewRecord && (
 *               <span className="end-stats-record" data-testid="end-stats-record">
 *                 New record! …
 *               </span>
 *             )}
 *           </dd>
 *         </div>
 *       )}
 *     </dl>
 *
 *   On the *loss* path (`phase === "ended"`, `finalScore !== null`,
 *   `isWin === false`) the conditional collapses, so neither the best-
 *   time `<dd>` nor the new-record badge should appear in the DOM. This
 *   matters for product reasons: a zero-score terminal hasn't earned a
 *   personal best, and the "New record!" badge should never co-occur
 *   with the loss headline ("Game over") — that would be a confusing
 *   mixed-signal UI.
 *
 *   Sibling W849 (endStatsRecord) pins both record-shown-on-win and
 *   record-hidden-when-no-PR-on-win; sibling W814 (endStatsTime) pins
 *   the time row's presence on win. Neither walks the loss branch, so
 *   the contract that the *whole* best-row vanishes on loss — even when
 *   a stored PR exists in localStorage that *would* render on a win —
 *   is currently unguarded. A regression that demoted the guard from
 *   `{isWin && …}` to `{phase === "ended" && …}`, or split the
 *   record-badge guard out from the row guard, would render the badge
 *   underneath a "Game over" headline without breaking any existing
 *   test.
 *
 * Strategy:
 *   Mirror W845's hoisted-plugin fixture (a reducer that flips into
 *   `isTerminal: { score: 0 }` on a single dispatched action) so
 *   PlayPage walks the loss branch (`isWin === false`,
 *   `showLossBanner === true`). Pre-seed `cards-best-times` with a slow
 *   stored PR so that, *if* the guard were buggy and the row leaked to
 *   the loss path, the row's `<dd>` text would be a real "MM:SS" value
 *   rather than the "—" empty-state — making the failure unambiguous.
 *   After the loss banner mounts, assert:
 *     1. The end-panel mounts with `data-win="false"` (loss branch
 *        confirmed — sanity check so a passing absence assertion isn't
 *        a false positive caused by the panel never rendering at all).
 *     2. `end-stats` *is* mounted and `end-stats-time` is present
 *        (the time row sits OUTSIDE the `isWin` guard, so it must
 *        render on loss too — otherwise our negative assertions below
 *        would pass for the wrong reason).
 *     3. `end-stats-best` is NOT in the DOM (the `{isWin && …}` guard
 *        collapsed the whole row).
 *     4. `end-stats-record` is NOT in the DOM (nested badge is gated
 *        twice — once by `isWin`, once by `isNewRecord` — and the
 *        outer guard is the one being verified here).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape (see W792
// for the win-vs-lose discriminator at PlayPage.tsx:1240, `term.score > 0`).
// Mirrors W845's loss-banner fixture verbatim.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-best-row-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Best Row Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner best-row absence assertion.",
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

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss-banner best-time row absence (W867)", () => {
  it("does NOT render end-stats-best (or the record badge) on a zero-score terminal, even when a stored PR would otherwise display", async () => {
    // Pre-seed a stored PR. If the `{isWin && …}` row guard ever
    // regressed to `{phase === "ended" && …}`, the row's `<dd>`
    // would render a real "MM:SS" string ("00:10" here) instead of
    // the "—" empty-state — making a leaked-row failure unambiguous
    // and not silently masked by a missing-PR fallback.
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ [hoisted.TEST_GAME_ID]: 10 }),
    );

    const { default: PlayPage } = await import("./PlayPage.js");

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
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // (1) End-panel mounted with data-win="false" — confirms the
    // `isWin === false`, `isLoss === true` branch is the one driving render.
    // Without this sanity check, the `queryByTestId(...).toBeNull()`
    // assertions below could pass for the wrong reason (e.g., the panel
    // never rendering because the terminal transition broke).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // (2) The `end-stats` <dl> and the time row inside it MUST still be
    // mounted on loss — only the best-time row is `isWin`-gated, the
    // time row sits outside that guard. This is the positive-control
    // half of the assertion: it proves we're rendering far enough into
    // the JSX that the negative assertions below are meaningful.
    expect(screen.getByTestId("end-stats")).toBeTruthy();
    expect(screen.getByTestId("end-stats-time")).toBeTruthy();

    // (3) The `{isWin && …}` guard around the best-time row collapses
    // on loss → the `<dd data-testid="end-stats-best">` node is absent.
    // queryByTestId returns null (vs. getByTestId throwing).
    expect(screen.queryByTestId("end-stats-best")).toBeNull();

    // (4) The nested "New record!" badge is gated twice (`isWin` AND
    // `isNewRecord`); on loss the outer `isWin` guard alone is enough
    // to drop it, regardless of whether `isNewRecord` would have
    // flipped on. Pin the badge's absence so a regression that splits
    // the badge guard out from the row guard — leaving the record
    // badge underneath a "Game over" headline — surfaces here.
    expect(screen.queryByTestId("end-stats-record")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
