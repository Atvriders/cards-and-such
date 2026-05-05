/**
 * Unit test for the PlayPage end-panel `.end-seed` wrapper tagName (W1769).
 *
 * Observable behavior:
 *   When the round reaches a terminal state, PlayPage.tsx (~line 2718)
 *   renders the seed readout as a `<div>` directly inside the end-panel
 *   `<section>`:
 *
 *     <div className="end-seed" data-testid="end-seed">
 *       Seed: <code>{seed}</code>
 *     </div>
 *
 *   Sibling tests cover this region:
 *     - W818 (PlayPage.endSeed): the `data-testid="end-seed"` mount and
 *       the rendered `Seed: NNNNN` textContent (including the inner
 *       `<code>` value).
 *     - W (lossBannerSeed): the loss-path mount of the same element.
 *   None of them pin the *element type* of the seed wrapper. A
 *   regression that swapped the wrapper from `<div>` to `<span>`, `<p>`,
 *   or any inline element would silently break the surrounding flex
 *   column layout (PlayPage.css's `.end-panel` rules assume the
 *   end-seed line is a block-level child) while every existing class /
 *   testid / textContent assertion continued to pass.
 *
 *   An exhaustive grep across PlayPage*.test.tsx for `end-seed.*tagName`
 *   / `end-seed.*nodeName` returns no results — no test asserts the
 *   end-seed element is specifically a `<div>`. This test fills that
 *   gap with the minimum surface: drive the round to terminal-win,
 *   locate the end-seed by testid, and pin `tagName === "DIV"`.
 *
 * Strategy mirrors W818's hoisted fixture pattern verbatim — minimal
 * plugin whose reducer increments `moves` and whose `isTerminal`
 * returns a positive score once `moves >= 1` so a single click drives
 * PlayPage into the terminal-win branch where the end-panel and its
 * `.end-seed` line mount.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: reducer increments `moves`; `isTerminal` flips to a
// winning `{ score: 1 }` payload after one dispatch, so a single fixture
// button click drives PlayPage straight into the terminal-win branch where
// the end-panel and its `.end-seed` line render.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-seed-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Seed Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-seed wrapper tagName test.",
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

describe("PlayPage end-panel .end-seed wrapper tagName (W1769)", () => {
  it("renders the .end-seed element as a <div> after a win", async () => {
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

    // Pre-condition: the end-seed line is not mounted before the round
    // terminates — it lives behind the `phase === "ended" && finalScore
    // !== null` render gate inside the end-panel section.
    expect(screen.queryByTestId("end-seed")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: end-panel mounted, so the .end-seed inside it should too.
    expect(screen.getByTestId("end-panel")).toBeTruthy();

    const endSeed = screen.getByTestId("end-seed");
    expect(endSeed).toBeTruthy();

    // The contract pin: the .end-seed wrapper is specifically a <div>
    // — the block-level element type the source writes in the JSX
    // (`<div className="end-seed" data-testid="end-seed">…</div>`).
    // Sibling tests pin the testid and text content; this is the
    // tagName contract that keeps the seed-line rendering as a
    // block-level row inside the end-panel flex column rather than a
    // span / p / heading substitute that would shift the layout.
    expect(endSeed.tagName).toBe("DIV");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
