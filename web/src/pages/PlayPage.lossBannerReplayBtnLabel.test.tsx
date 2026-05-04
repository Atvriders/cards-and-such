/**
 * Unit test for the PlayPage loss-banner replay-btn visible label (W889).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2729-2736) renders the end-actions row inside the
 *   shared end-panel with a `<button data-testid="replay-btn">` whose
 *   visible label is `{t("hud.replay")}` — which the i18n table at
 *   platform/i18n.ts (~line 62) maps to the literal string "Replay".
 *   The label is the only on-screen affordance distinguishing the replay
 *   button from its sibling new-game-btn (which renders "New Game" via
 *   `t("hud.new_game")` at line 2727); the two buttons are otherwise
 *   adjacent in the same end-actions row with near-identical class names
 *   ("play-again-btn play-again-btn--big" vs "play-again-btn
 *   play-replay-btn play-again-btn--big").
 *
 *   W881 (sibling above) pins the *Enter-key activation* contract on the
 *   autofocused replay-btn after a loss. W879 pins Esc-dismiss. W861 pins
 *   the new-game-btn restart on the loss path. W834 pins Enter-restart on
 *   the win path. None of those tests assert what the user actually sees
 *   on the replay button itself: a regression that swapped the i18n key
 *   (e.g. `t("hud.new_game")` → both buttons read "New Game"), hard-coded
 *   the wrong literal, or left the label as the bare key
 *   (`t("hud.replay")` returning `"hud.replay"` on a missing translation)
 *   would silently hide the "Replay" affordance from losing players while
 *   the keyboard, focus, and click-restart pins all stay green.
 *
 * Strategy:
 *   Mirror W861's loss fixture (single-dispatch zero-score terminal,
 *   hoisted plugin, registry mock, confetti null-stub) so PlayPage walks
 *   the loss branch (`isWin === false`, `isLoss === true`,
 *   `showLossBanner === true`). After the loss banner mounts, look up
 *   the replay-btn by testid and assert its trimmed `textContent` equals
 *   the literal "Replay" — the exact string the i18n table maps the key
 *   to. The assertion is intentionally a `.trim()` on textContent rather
 *   than a regex, so a regression that injected an icon or extra
 *   whitespace would still match, but a swap to "New Game" / "Try again"
 *   / a missing-translation `"hud.replay"` fallthrough would not.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — mirrors W861/W881. Reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action; isTerminal returning a
// zero-or-negative score is the canonical "loss" discriminator (see
// PlayPage.tsx ~line 1384, `isWin = ... && finalScore > 0`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-replay-btn-label-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Replay Btn Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner replay-btn visible label.",
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
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage loss-banner replay-btn visible label (W889)", () => {
  it('renders the literal "Replay" label on the replay-btn after a loss', async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0). One click is
    // enough — the fixture's isTerminal flips to `{ score: 0 }` on the
    // first dispatched LOSE, mounting the loss banner and its
    // end-actions row (which contains the replay-btn).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity-check the loss branch is the one driving render — guards
    // against a fixture mis-wire that accidentally produced a positive
    // score and made this test about the win-banner replay button
    // instead of the loss-banner one.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // The contract pin: the replay-btn's visible textContent is the
    // literal "Replay" — the value the i18n table maps `hud.replay` to
    // (see platform/i18n.ts ~line 62). A regression that swapped the
    // key to `hud.new_game` would render "New Game" here; a missing
    // translation would surface the bare key "hud.replay"; a hard-code
    // to "Try again" / "Retry" would also fail.
    const replayBtn = screen.getByTestId("replay-btn");
    expect((replayBtn.textContent ?? "").trim()).toBe("Replay");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
