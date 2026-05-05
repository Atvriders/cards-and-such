/**
 * Unit test for the PlayPage end-banner end-stats *time* dt label TEXT (W2432).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2697) renders
 *   the time-row label as `<dt>{t("hud.time")}</dt>` inside the
 *   `<dl class="end-stats">` definition list. The translated value of
 *   `hud.time` (resolved via `../platform/i18n.js`) is the literal string
 *   "Time" — that is the visible text users read alongside the formatted
 *   elapsed clock to identify the row's value.
 *
 *   Sibling W1398 (PlayPageEndStatsTimeDtTag) pins the time-row label's
 *   tagName as "DT". Sibling W1976 (PlayPageEndStatsDtCount) pins the
 *   total dt count under the dl as 2. Sibling W1095
 *   (endStatsRowStructural) pins the row wrapper class and asserts each
 *   row contains *some* dt. None of these checks pin the *visible label
 *   text*. A regression that swapped the i18n key (e.g. `hud.time` →
 *   `hud.elapsed`), inlined the wrong literal ("Elapsed", "T", an empty
 *   string), or stripped the children entirely would slip past every
 *   tagName / count / wrapper-class assertion while breaking the
 *   semantic pairing users rely on to read the row.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W1398 / W1976 so a single
 *   dispatcher click drives PlayPage to terminal-win. After the win
 *   banner mounts, anchor on the unconditional `end-stats-time` dd,
 *   walk to its parent `.end-stats-row`, locate the row's first child
 *   element (the dt label per W1398), and assert its trimmed
 *   `textContent` is exactly "Time" — the resolved English value of
 *   `hud.time` in `web/src/platform/i18n.ts`. This pins the *one*
 *   uncovered attribute — the dt label's visible text on the
 *   unconditional time row — without re-asserting tagName, value, or
 *   grouping that sibling tests already cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-dt-time-text-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Dt Time Text Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats time dt text test.",
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

describe("PlayPage end-banner end-stats time dt text (W2432)", () => {
  it("renders the time-row dt label with text \"Time\"", async () => {
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

    // The row's first child element is the dt label (pinned as DT by
    // W1398). Its visible text must be the resolved value of
    // `hud.time` — literally "Time" per `web/src/platform/i18n.ts`.
    const label = row!.firstElementChild;
    expect(label).not.toBeNull();
    expect(label!.textContent?.trim()).toBe("Time");
  });
});

void React;
