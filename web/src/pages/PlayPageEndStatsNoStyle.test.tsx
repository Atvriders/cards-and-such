/**
 * Pinpoint test for the PlayPage end-banner end-stats `<dl>` `style`
 * attribute absence (W2100).
 *
 * Observable behavior:
 *   When the round terminates, PlayPage.tsx (~line 2695) renders the
 *   end-stats block as
 *     `<dl className="end-stats" data-testid="end-stats">…</dl>`
 *   inside the `[data-testid="end-panel"]` section. Visual layout for
 *   this wrapper is delegated entirely to the stylesheet via the
 *   `.end-stats` className — no inline `style` attribute is emitted by
 *   the component. Adding an inline style would override the cascade,
 *   defeat theming, and create per-instance specificity that bypasses
 *   the design system.
 *
 *   Existing end-stats tests cover the wrapper from many angles:
 *     • exact className "end-stats" (W1907, EndStatsContainerClass)
 *     • `classList.contains("end-stats")` structural pin (W1099)
 *     • `id` attribute absence (W2031, EndStatsNoId)
 *     • dt/dd row counts (EndStatsDtCount, EndStatsDdCount)
 *     • per-cell content/labels (Time/Best/Record/Prev tests)
 *
 *   None pin the `style` attribute. That gap means an accidental
 *   inline-style graft (e.g. an ad-hoc `style={{ color: "..." }}`)
 *   could land silently and override the stylesheet contract. This
 *   test fills the gap with the minimum surface: render → drive a
 *   win → grab `[data-testid="end-stats"]` and assert
 *   `dl.hasAttribute("style") === false`. `hasAttribute` returns true
 *   for any string value (including ""), so this fails loudly the
 *   moment the wrapper grows any kind of inline style attribute.
 *
 * Strategy mirrors W2031 (PlayPageEndStatsNoId.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — drives PlayPage
 *     into the terminal-win branch where the end-panel and its
 *     `.end-stats` `<dl>` mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, locate the wrapper via
 *     `data-testid="end-stats"`, and assert `hasAttribute("style")` is
 *     false on that node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-no-style-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats No Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the end-stats <dl> style-attribute absence test.",
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

describe("PlayPage end-stats <dl> style-attribute absence (W2100)", () => {
  it("renders the end-stats definition list with no inline style attribute", async () => {
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
    // `phase === "ended" && finalScore !== null` render gate.
    expect(screen.queryByTestId("end-stats")).toBeNull();

    // Drive the round to terminal-win. One click increments moves
    // (0 -> 1), `isTerminal` returns a winning payload, and the
    // end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Locate via data-testid (the contract pinned elsewhere) so this
    // test isolates exactly the end-stats <dl> wrapper node.
    const endStats = screen.getByTestId("end-stats");
    expect(endStats).toBeTruthy();
    // Sanity: the located node really is the <dl> we mean to pin.
    expect(endStats.tagName).toBe("DL");

    // Pin "no inline style". `hasAttribute("style")` returns true for
    // any string value (including ""), so this fails loudly the
    // moment the wrapper grows any kind of inline style attribute.
    expect(endStats.hasAttribute("style")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
