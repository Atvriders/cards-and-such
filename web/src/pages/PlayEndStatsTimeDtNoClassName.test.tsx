/**
 * Unit test for the PlayPage end-banner end-stats *time* dt `class` absence (W2441).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2697) renders
 *   the time-row label as
 *     `<dt>{t("hud.time")}</dt>`
 *   inside the `<dl class="end-stats">` definition list. The dt has NO
 *   `class` attribute — all visual styling is delegated to descendant
 *   selectors on the parent `.end-stats` / `.end-stats-row` containers
 *   (and to the dt's tag selector in `PlayPage.css`). Sibling tests pin
 *   the dt's tagName (W1398), the dt's visible text content (W2432), the
 *   total dt count under the dl (W1976), the row wrapper class (W1095),
 *   and the *dd*'s lack of class/id/style/tabindex (W2403/W2057/W2178/etc).
 *   None of those checks pin the absence of a `class` attribute on the
 *   time-row's dt label. A regression that added a className to the dt
 *   (for example, a refactor that introduced
 *   `<dt className="end-stats-time-label">…</dt>` to gain a per-row hook
 *   for theme overrides) would change the CSS-class surface that
 *   downstream theme stylesheets and end-to-end selectors rely on, with
 *   no failing test. The current implementation deliberately keeps the
 *   dt className-less.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W1398 / W2432 so a single
 *   dispatcher click drives PlayPage to terminal-win. After the win
 *   banner mounts, anchor on the unconditional `end-stats-time` dd, walk
 *   to its parent `.end-stats-row`, locate the row's first child element
 *   (the dt label per W1398), and assert
 *   `dt.hasAttribute("class") === false`. This pins the *one* uncovered
 *   attribute — the absence of a `class` attribute on the time-row dt
 *   label — without re-asserting tagName, text, count, or grouping that
 *   sibling tests already cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-time-dt-no-classname-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Time Dt No ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats time dt no-className test.",
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

describe("PlayPage end-banner end-stats time dt no className (W2441)", () => {
  it("does not set a class attribute on the time-row dt label", async () => {
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
    // row wrapper. The row's first element child is the dt label (its
    // tagName is pinned as DT by W1398).
    const endStatsTime = screen.getByTestId("end-stats-time");
    const row = endStatsTime.closest(".end-stats-row");
    expect(row).not.toBeNull();

    const label = row!.firstElementChild;
    expect(label).not.toBeNull();

    // The time-row dt delegates all visual styling to descendant
    // selectors on the parent `.end-stats` / `.end-stats-row` containers
    // and to the dt's tag selector. Pinning the absence of a `class`
    // attribute guards against a future refactor that would add a
    // label-specific className without a test reflecting the new
    // CSS-class contract.
    expect(label!.hasAttribute("class")).toBe(false);
  });
});

void React;
