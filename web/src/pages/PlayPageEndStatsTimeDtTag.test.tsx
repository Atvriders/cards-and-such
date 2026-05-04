/**
 * Unit test for the PlayPage end-banner end-stats *time* dt label tag (W1398).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2697) renders
 *   the time-row label as `<dt>{t("hud.time")}</dt>` inside the
 *   `<dl class="end-stats">` definition list. Sibling W1376
 *   (PlayPageEndBannerTimeTag) pins the *time* dd's tagName, W1384
 *   (PlayPageEndStatsBestTag) pins the *best* dd's tagName, and W1095
 *   (endStatsRowStructural) only asserts that *some* `<dt>` exists per
 *   row via `row.querySelector("dt")` (a truthiness check that would
 *   pass even if the label were rebuilt as `<dt><span>…</span></dt>`
 *   only). No existing test pins the *first* end-stats label's element
 *   to literally `tagName === "DT"`. A regression that swapped the
 *   label `<dt>` for a `<span>`, `<p>`, or `<div className="label">`
 *   would break the dt/dd semantic pairing (and the
 *   `.end-stats-row dt` CSS selector keying off that tag in
 *   `PlayPage.css`) while the time *value* dd assertions and the row
 *   wrapper test continued to pass — because the row wrapper test
 *   uses `querySelector("dt")` (returns `null` only if there is *no*
 *   descendant dt anywhere), not a tagName-equality check on the
 *   row's first child.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W1384 so a single
 *   dispatcher click drives PlayPage to terminal-win. After the win
 *   banner mounts, query the `end-stats-time` dd, walk to its parent
 *   `.end-stats-row`, locate the row's *label* element (the first
 *   child node that is NOT the `dd[data-testid="end-stats-time"]`),
 *   and assert its `tagName` is "DT". This pins the *one* uncovered
 *   attribute — the dt label's element type on the unconditional time
 *   row — without re-asserting value, visibility, or grouping that
 *   sibling tests already cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-time-dt-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Time Dt Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats time dt tag test.",
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

describe("PlayPage end-banner end-stats time dt tag (W1398)", () => {
  it("renders the time-row label as a <dt> element", async () => {
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

    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Anchor on the unconditional `end-stats-time` dd, then walk to its
    // row wrapper. This is the row whose dt label this test pins.
    const endStatsTime = screen.getByTestId("end-stats-time");
    const row = endStatsTime.closest(".end-stats-row");
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
