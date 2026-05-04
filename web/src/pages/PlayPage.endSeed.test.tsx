/**
 * Unit test for the PlayPage win-banner end-seed value (W818).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2718)
 *   renders a `<div class="end-seed" data-testid="end-seed">Seed: <code>{seed}
 *   </code></div>` inside the end-panel. The numeric `seed` is the same value
 *   the plugin's RNG was initialised with, sourced from the URL `?seed=`
 *   query param via `parseSeed`. Sibling tests cover the win-banner headline
 *   (W801), final-score (W805), end-stats-time (W809), end-stats-best (W814),
 *   and end-back-btn — but no test pins the rendered seed readout. A
 *   regression that wired the `<code>` to a stale state, ignored the URL
 *   seed, or formatted the number wrong would slip through every adjacent
 *   test while silently mis-reporting the round's reproducibility token.
 *
 * Strategy:
 *   Mirror the hoisted fixture from W805 (PlayPage.winBannerScore.test.tsx)
 *   so a single dispatcher click drives PlayPage to terminal-win. Mount with
 *   `?seed=12345&quickstart=1` so the seed-from-URL initialiser path is
 *   exercised and the setup screen is skipped. After winning, assert
 *   `end-seed` is mounted and its textContent contains both the "Seed:"
 *   label and the literal "12345" value — matching the source format
 *   `Seed: <code>{seed}</code>`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a winning
// payload once `moves >= 1`, so a single dispatch from the fixture button
// drives PlayPage into the terminal-win branch and renders the win banner
// with the end-seed line. The exact score is irrelevant — we only assert
// the seed readout — but a positive value keeps us on the win path.
// ---------------------------------------------------------------------------
const URL_SEED = 12345;

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-seed-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Seed Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner end-seed test.",
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
  vi.restoreAllMocks();
});

describe("PlayPage win-banner end-seed value (W818)", () => {
  it("renders the URL seed inside the end-seed element after a win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // `?seed=12345` exercises the `parseSeed(searchParams.get("seed"))`
    // path so the seed state initialises from the URL rather than a
    // randomSeed() / readLastSeed() fallback. `?quickstart=1` skips the
    // setup screen so the fixture component (and its win-dispatcher
    // button) mounts immediately.
    render(
      <MemoryRouter
        initialEntries={[
          `/play/${hoisted.TEST_GAME_ID}?seed=${URL_SEED}&quickstart=1`,
        ]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-seed is NOT mounted before the game ends — it
    // lives inside the `phase === "ended"` end-panel branch of the JSX.
    expect(screen.queryByTestId("end-seed")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the end-seed node must now be
    // mounted. A regression that dropped the data-testid would surface
    // here even if the visible text remained correct.
    const endSeed = screen.getByTestId("end-seed");
    expect(endSeed).toBeTruthy();

    // The whole point of the test: the rendered text must reflect the
    // URL-supplied seed. The source format is `Seed: <code>{seed}</code>`,
    // so the trimmed textContent is exactly "Seed: 12345". A regression
    // that wired the `<code>` to a stale variable, ignored the URL seed,
    // or formatted the number wrong is caught here.
    expect(endSeed.textContent?.trim()).toBe(`Seed: ${URL_SEED}`);

    // Belt-and-suspenders: the inner `<code>` element specifically holds
    // the numeric seed. Asserting on it pins the structural contract
    // (label outside, value inside <code>) independent of incidental
    // whitespace in the wrapper div.
    const codeEl = endSeed.querySelector("code");
    expect(codeEl?.textContent).toBe(String(URL_SEED));
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
