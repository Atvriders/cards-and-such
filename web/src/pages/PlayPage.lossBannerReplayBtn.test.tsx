/**
 * Unit test for the PlayPage loss-banner "Replay" button (W887).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2729) renders an `end-actions` row inside the shared
 *   end-panel that contains a `<button data-testid="replay-btn">` whose
 *   onClick invokes the `replay` callback. `replay()` calls
 *   `startWithSeed(seed)` against the *current* seed — i.e. the same seed
 *   the player just lost on — which resets `finalScore` to null and flips
 *   `phase` back to "playing". That closes the end-panel render gate
 *   (`phase === "ended" && finalScore !== null`) and tears the panel down,
 *   restarting the round at the SAME deal so the player can immediately
 *   retry the puzzle they just lost.
 *
 *   W822 pins the analogous contract on the WIN path for the new-game-btn
 *   (fresh random seed, autofocused on win). W861 pins the loss-path
 *   new-game-btn (fresh seed, not autofocused on loss). W881 pins the
 *   keyboard Enter-restart flow on the loss-banner — which relies on
 *   `replay-btn` being autofocused (`autoFocus={showLossBanner}` at
 *   PlayPage.tsx ~line 2733) and Enter on a focused button firing its
 *   onClick. The piece W881 leaves implicit is the *click* contract on
 *   the replay button itself: that clicking it tears the panel down AND
 *   keeps the seed identical (the user-visible distinction from
 *   new-game-btn — replay = "try this same deal again", new-game = "give
 *   me a fresh deal").
 *
 *   A regression that rewired `replay-btn`'s onClick to `newGame`
 *   (random seed) instead of `replay` (current seed), or that swapped
 *   `startWithSeed(seed)` to `startWithSeed(randomSeed())` inside
 *   `replay`, would silently change the seed on every "Replay" click —
 *   destroying the most useful affordance for losing players (a fresh
 *   shot at the *same* puzzle) — while every neighbouring loss-banner
 *   test (W845/W861/W879/W881) continued to pass.
 *
 * Strategy:
 *   - Hoisted klondike-id fixture (mirrors W748/W744 hotkey tests so the
 *     toolbar `seed-display` element renders — `showProminentSeed` is
 *     gated to klondike/freecell/spider at PlayPage.tsx ~line 1373).
 *     `seed-display` only mounts while `phase === "playing"` (line 1831),
 *     so observing `#42` in the DOM after the click is itself proof that
 *     the panel tore down AND the seed survived.
 *   - Reducer flips to `{ score: 0 }` on a single dispatched LOSE action
 *     (mirrors W861/W881's loss fixture — zero-or-negative score is the
 *     canonical loss discriminator at PlayPage.tsx ~line 1384,
 *     `isWin = ... && finalScore > 0`).
 *   - Pre-seed `cards-tutorial-seen` for klondike so the auto-launched
 *     tutorial doesn't gate the fixture component behind a tutorial
 *     overlay — `quickstart=1` skips the setup screen but the tutorial
 *     can still pop on first play of klondike.
 *   - Mount with `?seed=42&quickstart=1` to pin a known starting seed
 *     and skip setup. Drive to terminal-loss with a single click on the
 *     fixture's lose button.
 *   - After loss banner mounts, click `replay-btn` and assert:
 *       (a) end-panel unmounts (proves phase flipped back to "playing"
 *           and finalScore reset — the click did *something*); AND
 *       (b) seed-display still shows "#42" (proves the seed was
 *           preserved — distinguishes replay from new-game-btn, which
 *           would have called startWithSeed(randomSeed())).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Klondike id makes `showProminentSeed` true so the
// toolbar `seed-display` element renders — that's our "did the seed
// change?" observable. Reducer flips to a `{ score: 0 }` terminal on a
// single LOSE dispatch, mirroring W861/W881.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  // Real klondike id so `showProminentSeed` (PlayPage.tsx ~line 1373) is
  // true and the seed-display testid mounts.
  const TEST_GAME_ID = "klondike";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (loss-banner replay-btn test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner replay-btn assertion.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ lost: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "LOSE" ? { lost: true } : s,
    isTerminal: (s: State) => (s.lost ? { score: 0 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-lose"
          onClick={() => dispatch({ type: "LOSE" })}
        >
          lose
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
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  // klondike has tutorial steps; the auto-launched tutorial would set
  // tutorialOpen=true and could cover the fixture. Mark seen so the
  // bare game with the fixture's lose button is what we land on.
  localStorage.setItem(
    "cards-tutorial-seen",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: true }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage loss-banner Replay button (W887)", () => {
  it("restarts at the same seed when clicked after a loss", async () => {
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

    // Pre-condition: seed-display reads the URL-supplied seed (#42), and
    // the end-panel + replay-btn are not yet mounted (still in "playing").
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(screen.queryByTestId("replay-btn")).toBeNull();

    // Drive the round into terminal-loss (score === 0). One LOSE dispatch
    // is enough — the fixture's isTerminal flips to `{ score: 0 }` on
    // first dispatch, mounting the loss banner and the autofocused
    // replay button.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: we're really on the loss branch (not the win branch from
    // W822), so the assertion below truly pins the loss-path replay-btn.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-after-loss: replay-btn is mounted on the loss-path
    // end-panel. A regression that hid it on the loss arm would surface
    // here even if the click handler stayed wired correctly.
    const btn = screen.getByTestId("replay-btn");
    expect(btn).toBeTruthy();

    // Click the Replay button. `replay` skips the in-progress confirm
    // (phase is "ended", not "playing") and calls `startWithSeed(seed)`
    // — passing the *current* seed (42), not a fresh random one.
    await act(async () => {
      fireEvent.click(btn);
    });

    // Contract pin (a): end-panel render gate
    // (`phase === "ended" && finalScore !== null`) is closed and the
    // panel — including the replay button — unmounts. A no-op click
    // handler would leave both nodes in the tree.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(screen.queryByTestId("replay-btn")).toBeNull();

    // Contract pin (b): seed-display is back (it only renders while
    // `phase === "playing"` — PlayPage.tsx ~line 1831) AND it still
    // shows "#42". This is the load-bearing distinction from
    // new-game-btn: a regression that swapped replay's
    // `startWithSeed(seed)` for `startWithSeed(randomSeed())` would
    // surface here as a different (random) seed value, while
    // contract (a) would still pass.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
