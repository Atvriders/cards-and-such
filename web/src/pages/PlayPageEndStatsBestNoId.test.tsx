/**
 * Unit test pinning that PlayPage's end-stats-best <dd> renders WITHOUT
 * an `id` attribute (W2058).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2703) renders
 *   `<dd data-testid="end-stats-best">…</dd>` inside the win-only branch
 *   of the end-stats <dl>. The element is identified solely by its
 *   `data-testid` — no `id` attribute is set in the JSX. Sibling tests
 *   (W endStatsBest/Tag/Record/Prev, endStatsStructural, endStatsRow*,
 *   endStatsDdCount, endStatsDtCount) cover the element's tag, parent
 *   chain, sibling presence, and text content but none of them assert
 *   the absence of `id`. A regression that introduced an `id` here
 *   (e.g. for a tooltip target or anchor link) would risk DOM-id
 *   collisions in apps embedding PlayPage and would slip past every
 *   testid-based check.
 *
 * Strategy:
 *   Reuse the hoisted-fixture WIN-pattern from W814 (endStatsBest):
 *   one fixture plugin whose reducer makes the round terminal-winning
 *   on first dispatch, mocked into the games registry. Drive PlayPage
 *   to terminal-win via a single button click, query the
 *   `[data-testid="end-stats-best"]` node, and assert
 *   `el.hasAttribute("id") === false`. This is a single, focused
 *   negative-presence assertion on an attribute that no other test
 *   currently pins.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a winning
// payload once `moves >= 1`, so a single dispatch from the fixture button
// drives PlayPage into the terminal-win branch and renders the win-only
// end-stats-best <dd>. The exact score is irrelevant — we only assert the
// id-attribute presence on that node.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-best-no-id-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Best No-Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner end-stats-best id-absence test.",
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

describe("PlayPage win-banner end-stats-best id absence (W2058)", () => {
  it("does not set an id attribute on the end-stats-best <dd>", async () => {
    // Install fake timers BEFORE mount per the W814 pattern so the 1Hz
    // `setInterval` that drives `elapsed` registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks alive so the quickstart effect can transition `phase`
    // to "playing" normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-stats-best is NOT mounted before the game ends —
    // it lives inside the `phase === "ended" && isWin` branch of the JSX.
    expect(screen.queryByTestId("end-stats-best")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sole assertion: the end-stats-best <dd> must NOT carry an `id`
    // attribute. The JSX identifies it solely by `data-testid`.
    const endStatsBest = screen.getByTestId("end-stats-best");
    expect(endStatsBest.hasAttribute("id")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
