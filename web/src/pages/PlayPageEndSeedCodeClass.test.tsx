/**
 * Unit test for the PlayPage end-banner end-seed inner <code> className (W1791).
 *
 * Observable behavior:
 *   When the round reaches a terminal state, PlayPage.tsx (~line 2718)
 *   renders the seed readout as:
 *
 *     <div className="end-seed" data-testid="end-seed">
 *       Seed: <code>{seed}</code>
 *     </div>
 *
 *   The inner <code> is intentionally bare — it carries NO className, so
 *   styling is driven entirely by the parent `.end-seed code` selector
 *   (or whatever element-level rule applies to the <code> tag). Sibling
 *   end-seed tests cover:
 *     - W818 (PlayPage.endSeed): wrapper testid mount + "Seed: NNN"
 *       textContent + `endSeed.querySelector("code")?.textContent`.
 *     - W1769 (PlayPageEndBannerEndSeedTag): wrapper tagName === "DIV".
 *     - W1785 (PlayPageEndSeedCodeTag): firstElementChild.tagName === "CODE".
 *
 *   None of those assert that the inner <code> has NO className — a
 *   regression that injected `<code className="seed-token">{seed}</code>`
 *   or `<code className="mono">…</code>` would still satisfy every
 *   tagName / textContent assertion in the suite while quietly coupling
 *   the seed readout to a specific class-based style hook that the
 *   `.end-seed code` element-selector contract is meant to avoid.
 *
 *   This test fills the gap with the minimum surface: drive the round to
 *   terminal-win, locate the end-seed wrapper, grab its firstElementChild
 *   (the <code>), and pin `className === ""`. Using strict equality (not
 *   `.toBeFalsy()`) means the assertion fails the moment any class — even
 *   a single space-separated token — is added to the inner element.
 *
 * Strategy:
 *   Mirror W1785's hoisted-fixture pattern verbatim — minimal plugin
 *   whose reducer increments `moves` and whose `isTerminal` returns a
 *   positive score after one dispatch, so a single click drives PlayPage
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
  const TEST_GAME_ID = "end-seed-code-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Seed Code Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the end-seed inner <code> className test.",
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

describe("PlayPage end-banner end-seed inner <code> className (W1791)", () => {
  it("renders the end-seed's inner <code> with an empty className", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=77&quickstart=1`]}
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

    // The contract pin: the inner <code> carries NO className. Styling
    // flows from the `.end-seed code` element selector — adding a class
    // here would couple the seed readout to a class-based style hook
    // the source intentionally avoids. Strict equality (not toBeFalsy)
    // catches even a single whitespace-only token regression.
    const innerEl = endSeed.firstElementChild as HTMLElement | null;
    expect(innerEl).not.toBeNull();
    expect(innerEl!.tagName).toBe("CODE");
    expect(innerEl!.className).toBe("");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
