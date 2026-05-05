/**
 * Unit test for the PlayPage end-banner end-stats *best* dt label tag (W2449).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2702) renders
 *   the personal-best row's label as `<dt>{t("hud.best")}</dt>` inside the
 *   `<dl class="end-stats">` definition list, paired with the
 *   `<dd data-testid="end-stats-best">` that holds the formatted best time
 *   (or the em-dash placeholder). Sibling W1398
 *   (PlayPageEndStatsTimeDtTag) pins the *time* dt's tagName, W1384
 *   (PlayPageEndStatsBestTag) pins the *best* dd's tagName, and W1095
 *   (endStatsRowStructural) only asserts that *some* `<dt>` exists per
 *   row via `row.querySelector("dt")` (a truthiness check that would
 *   pass even if the label were rebuilt as `<dt><span>…</span></dt>`
 *   only). No existing test pins the *best* row label element to
 *   literally `tagName === "DT"`. A regression that swapped the best
 *   label `<dt>` for a `<span>`, `<p>`, or `<div className="label">`
 *   would break the dt/dd semantic pairing (and the
 *   `.end-stats-row dt` CSS selector keying off that tag in
 *   `PlayPage.css`) while the best *value* dd assertions and the row
 *   wrapper test continued to pass — because the row wrapper test
 *   uses `querySelector("dt")` (returns `null` only if there is *no*
 *   descendant dt anywhere), not a tagName-equality check on the
 *   row's first child.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W1398 so a single
 *   dispatcher click drives PlayPage to terminal-win and the
 *   `{isWin && …}`-gated best row mounts. After the win banner appears,
 *   query the `end-stats-best` dd, walk to its parent `.end-stats-row`,
 *   take the row's first element child (the label), and assert its
 *   `tagName` is "DT". This pins the *one* uncovered attribute — the
 *   dt label's element type on the win-only best row — without
 *   re-asserting value, visibility, or grouping that sibling tests
 *   already cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-best-dt-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Best Dt Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats best dt tag test.",
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

describe("PlayPage end-banner end-stats best dt tag (W2449)", () => {
  it("renders the personal-best row label as a <dt> element", async () => {
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

    // Pre-condition: the `{isWin && …}`-gated best row is not mounted
    // before the round terminates with a win.
    expect(screen.queryByTestId("end-stats-best")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity-check the win branch — guards the assertion below from
    // passing for the wrong reason if the terminal transition broke.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("true");

    // Anchor on the win-only `end-stats-best` dd, then walk to its
    // row wrapper. This is the row whose dt label this test pins.
    const endStatsBest = screen.getByTestId("end-stats-best");
    const row = endStatsBest.closest(".end-stats-row");
    expect(row).not.toBeNull();

    // The row's first child element is the label. Pinning it via the
    // row's *first* element child (not a generic descendant dt search)
    // ensures a regression that prepended a non-dt sibling — e.g.
    // `<span class="label">…</span>` followed by `<dt>` — would still
    // be caught by the tagName assertion below.
    const label = row!.firstElementChild;
    expect(label).not.toBeNull();
    // The label MUST be a `<dt>` so it pairs with the trailing `<dd>`
    // for dt/dd semantics and the `.end-stats-row dt` CSS selector.
    expect(label!.tagName).toBe("DT");
  });
});

void React;
