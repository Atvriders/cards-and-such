/**
 * Unit test for the PlayPage end-banner Save-Replay button visibility on
 * the loss path (W866).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2787-2806) wraps the `play-save-replay` button in
 *   an `{isWin && (...)}` guard inside the shared end-share-row. This is
 *   intentional: the replay archive is positioned as a celebratory feature
 *   ("save this win for later") and replays of a defeat aren't part of the
 *   product surface. Sibling W848/W849/W862 (replaySave / replaySaveLabel /
 *   replaySaveTrack / replaySaveDoubleClick) all pin the WIN-path behavior
 *   of this button, but none of them assert that it is *absent* on the
 *   loss path. W845/W850/W856/W861 pin the loss-banner headline,
 *   end-seed copy, back-to-lobby link, and new-game button respectively,
 *   but they don't touch the share-row.
 *
 *   A regression that dropped the `isWin &&` guard — e.g. a refactor that
 *   pulled the share-row into a shared component without re-applying the
 *   gate, or a change that swapped the gate to a truthy `phase === "ended"`
 *   check — would silently render "Save replay" under a Game-Over headline.
 *   That'd corrupt the replay archive with zero-score sessions and confuse
 *   the win-bias the feature is built around. No existing test would
 *   catch it: every replay-save test renders the WIN path, and every
 *   loss-banner test ignores the share-row.
 *
 * Strategy:
 *   Mirror W861's loss fixture — a reducer that flips into
 *   `isTerminal: { score: 0 }` on a single dispatched action — so PlayPage
 *   walks the loss branch (`isWin === false`, `isLoss === true`,
 *   `showLossBanner === true`). After the loss banner mounts, sanity-check
 *   the loss-side neighbors are present (end-panel data-win="false" and
 *   the share-row itself is mounted, so a missing-row regression doesn't
 *   masquerade as a passing test) and then assert `play-save-replay`
 *   is NOT in the document. Co-asserting a sibling share button
 *   (`end-share-twitter`) IS rendered confirms the share-row exists and
 *   only the win-gated button is absent — distinguishing this test from
 *   a degenerate "everything is missing" failure mode.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — mirrors W861. Reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action; isTerminal returning a
// zero-or-negative score is the canonical "loss" discriminator (see
// PlayPage.tsx ~line 1389, `isLoss = phase === "ended" && finalScore !== null && !isWin`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-save-replay-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Save Replay Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner Save Replay button test.",
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

describe("PlayPage loss-banner Save Replay button visibility (W866)", () => {
  it("does not render the Save Replay button when the round ends in a loss", async () => {
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

    // Drive the round into terminal-loss (score === 0).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity-check the loss branch is the one driving render — guards
    // against a fixture mis-wire that accidentally produced a positive
    // score and made this test trivially pass on the win path (where the
    // button is unconditionally rendered).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Sibling-presence sanity: the share-row itself MUST be mounted, and
    // a non-gated share button (Twitter/Tweet) inside it must render.
    // Without this co-assertion, a regression that deleted the entire
    // end-share-row would silently pass the main assertion below.
    expect(screen.getByTestId("end-share-row")).toBeTruthy();
    expect(screen.getByTestId("end-share-twitter")).toBeTruthy();

    // The contract pin: the `play-save-replay` button is gated on
    // `isWin && (...)` (PlayPage.tsx ~line 2787) and must NOT render
    // when the round ended in defeat. A regression that dropped the
    // gate would surface here as a non-null query.
    expect(screen.queryByTestId("play-save-replay")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
