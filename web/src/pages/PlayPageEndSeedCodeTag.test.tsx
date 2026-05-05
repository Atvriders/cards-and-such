/**
 * Unit test for the PlayPage end-banner end-seed inner <code> tagName (W1785).
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
 *     - W818 (PlayPage.endSeed): the wrapper testid mount and the rendered
 *       "Seed: NNN" textContent, plus `endSeed.querySelector("code")?
 *       .textContent === String(seed)`.
 *     - W850 (PlayPage.lossBannerSeed): same contract on the loss path.
 *     - W1769 (PlayPageEndBannerEndSeedTag): wrapper tagName === "DIV".
 *
 *   None of those assert the *type* of the inner element holding the seed
 *   value. The existing `querySelector("code")` lookups select by tag name
 *   so they tautologically return a CODE element when one exists — but a
 *   regression that wrapped the seed in `<span>{seed}</span>` (or kbd, var,
 *   samp) AND added a stray `<code>` somewhere else inside the wrapper
 *   would still satisfy every textContent / querySelector assertion in
 *   the suite while quietly stripping the semantic monospace contract.
 *   `<code>` is the load-bearing element here: the visible monospace
 *   styling, copy-friendly selection, and screen-reader announcement of
 *   the seed-as-machine-token all rely on it being a real <code>.
 *
 *   This test fills the gap with the minimum surface: drive the round to
 *   terminal-win, locate the end-seed wrapper, then pin
 *   `endSeed.firstElementChild.tagName === "CODE"`. Using
 *   `firstElementChild` (not `querySelector("code")`) means the assertion
 *   fails the moment the inner element type changes — even if a code
 *   element still exists somewhere else in the subtree.
 *
 * Strategy:
 *   Mirror W818 / W1769's hoisted-fixture pattern verbatim — minimal
 *   plugin whose reducer increments `moves` and whose `isTerminal` returns
 *   a positive score after one dispatch, so a single click drives PlayPage
 *   into the terminal-win branch where the end-panel renders.
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
  const TEST_GAME_ID = "end-seed-code-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Seed Code Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the end-seed inner <code> tagName test.",
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

describe("PlayPage end-banner end-seed inner element tagName (W1785)", () => {
  it("renders the end-seed's first/only element child as a real <code> element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=99&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-seed not mounted before terminal — it lives
    // behind the `phase === "ended"` end-panel render gate.
    expect(screen.queryByTestId("end-seed")).toBeNull();

    // Drive to terminal-win. One click: reducer (moves 0→1), isTerminal
    // returns a winning payload, PlayPage transitions phase to "ended".
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const endSeed = screen.getByTestId("end-seed");
    expect(endSeed).toBeTruthy();

    // The contract pin: the inner element holding the seed value is a
    // real <code>. firstElementChild (not querySelector("code")) means
    // the assertion fails the moment the inner element type changes,
    // even if some other <code> still exists in the subtree. This is
    // the semantic-monospace contract sibling tests don't cover.
    const innerEl = endSeed.firstElementChild;
    expect(innerEl).not.toBeNull();
    expect(innerEl!.tagName).toBe("CODE");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
