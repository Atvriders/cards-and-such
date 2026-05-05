/**
 * Unit test for the PlayPage end-panel `.end-seed` wrapper className equality
 * (W1797).
 *
 * Observable behavior:
 *   When the round reaches a terminal state, PlayPage.tsx (~line 2718)
 *   renders the seed readout as:
 *
 *     <div className="end-seed" data-testid="end-seed">
 *       Seed: <code>{seed}</code>
 *     </div>
 *
 *   Sibling end-seed tests cover:
 *     - W818 (PlayPage.endSeed): testid mount + "Seed: NNN" textContent
 *       + the inner `<code>` textContent.
 *     - W1769 (PlayPageEndBannerEndSeedTag): wrapper tagName === "DIV".
 *     - W1785 (PlayPageEndSeedCodeTag): wrapper.firstElementChild.tagName
 *       === "CODE".
 *     - W1791 (PlayPageEndSeedCodeClass): inner `<code>` className === "".
 *
 *   None of those pin the *wrapper's own className equality* — they all
 *   either select via `data-testid` (so any extra/missing class would
 *   slip through) or assert tagName / inner-element shape. A regression
 *   that appended a stray utility class ("end-seed mt-2"), renamed it
 *   ("end-seed-line"), or dropped it entirely while keeping the testid
 *   would silently break the `.end-seed` CSS selectors in PlayPage.css
 *   (which style the seed line spacing, font, and the `.end-seed code`
 *   monospace pill) while every existing test continued to pass.
 *
 *   An exhaustive grep across PlayPage*.test.tsx for
 *   `endSeed.className`, `end-seed.*\.className`, or
 *   `className).toBe.*end-seed` returns no results — no test pins the
 *   wrapper className exactly. This test fills that gap.
 *
 * Strategy mirrors W1769's hoisted fixture verbatim — minimal plugin
 * whose reducer increments `moves` and whose `isTerminal` returns a
 * winning payload after one click, so a single dispatch drives PlayPage
 * into the terminal-win branch where the end-panel `.end-seed` line
 * mounts. Then assert `endSeed.className === "end-seed"` exactly.
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
  const TEST_GAME_ID = "end-seed-wrapper-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Seed Wrapper Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the end-seed wrapper className equality test.",
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

describe("PlayPage end-panel .end-seed wrapper className equality (W1797)", () => {
  it("renders the .end-seed wrapper with className exactly equal to 'end-seed' after a win", async () => {
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

    // The contract pin: the wrapper's className is *exactly* "end-seed"
    // — no extra utility classes, no rename, nothing dropped. This is
    // the surface the PlayPage.css `.end-seed` and `.end-seed code`
    // selectors depend on for the seed-line spacing, font, and the
    // monospace pill rendering of the inner `<code>` value. Sibling
    // tests use `getByTestId` (which would not catch a className
    // regression) or assert tagName / inner-element shape; this test
    // is the only place that pins the wrapper className equality.
    expect(endSeed.className).toBe("end-seed");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
