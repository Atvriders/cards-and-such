/**
 * Unit test for the win-banner save-replay button `title` tooltip (W1227).
 *
 * Observable behavior:
 *   The `play-save-replay` button rendered inside the win banner advertises
 *   *what* clicking it will do via its native `title` attribute:
 *     "Store this game's seed and recent actions to your replays"
 *   The hover tooltip is the only place the user is told what gets
 *   persisted (seed + recent actions) — the visible label only says
 *   "Save replay". A regression that drops or rewords the title would
 *   silently degrade discoverability of the replay feature without
 *   breaking the click handler, so existing click-flow tests
 *   (W642/W699/W729/W827/W839) would not catch it.
 *
 *   Sibling tests cover:
 *     - PlayPage.replaySave.test.tsx        — persistence shape + FIFO
 *     - PlayPage.replaySaveTrack.test.tsx   — analytics breadcrumb
 *     - PlayPage.replaySaveLabel.test.tsx   — visible textContent flip
 *     - PlayPage.replaySaveDoubleClick.test.tsx — no-op on second click
 *   None of them assert on the `title` (or `aria-label`) UI-contract
 *   attributes. This test fills that gap with a single focused
 *   assertion on the tooltip string.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` win-after-one-move fixture pattern as
 *     PlayPage.replaySaveLabel.test.tsx so a single dispatch drops
 *     PlayPage straight into the terminal-win branch that mounts the
 *     save button. `?quickstart=1` skips the setup screen.
 *   - Assert exact-match on the `title` attribute. Using equality (not
 *     substring) means a copy-edit that subtly changes meaning (e.g.
 *     "Save the current seed only") still fails, which is the whole
 *     point of locking the contract.
 *   - No click is dispatched on the save button itself: this test is
 *     about the *static* contract attr exposed on mount, independent
 *     of the saved/unsaved state machine.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage into the terminal-win branch
// that exposes the `play-save-replay` button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "save-replay-btn-attr-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Save Replay Btn Attr Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-save button title attr.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 100 } : null,
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
// terminal-win render side-effect-free, mirroring sibling tests.
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

describe("PlayPage win-banner save-replay button title attr (W1227)", () => {
  it("exposes the exact tooltip string describing what gets saved", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win so the save button mounts.
    fireEvent.click(screen.getByTestId("fx-win"));

    const saveBtn = screen.getByTestId("play-save-replay");

    // Lock the tooltip contract: any rewording, truncation, or removal
    // of the `title` attribute causes this assertion to fail.
    expect(saveBtn.getAttribute("title")).toBe(
      "Store this game's seed and recent actions to your replays",
    );
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
