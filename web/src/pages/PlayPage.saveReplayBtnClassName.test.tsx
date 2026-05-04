/**
 * Unit test for the win-banner save-replay button className (W1233).
 *
 * Observable behavior:
 *   The `play-save-replay` button rendered inside the win banner carries
 *   `className="play-share-pill"` (PlayPage.tsx ~line 2799). This class
 *   provides the shared "pill" visual styling that groups the save-replay
 *   button with the other end-of-game share-row controls (Print, Share
 *   image, Share seed, Twitter) so they read as a single visual cluster
 *   rather than mismatched buttons. A regression that drops or renames
 *   the class (e.g. during a CSS module migration) would visually orphan
 *   the save button without breaking any click-flow, label, aria-label,
 *   or title-attr test.
 *
 *   Sibling tests cover:
 *     - PlayPage.replaySave.test.tsx          — persistence shape + FIFO
 *     - PlayPage.replaySaveTrack.test.tsx     — analytics breadcrumb
 *     - PlayPage.replaySaveLabel.test.tsx     — visible textContent flip (W827)
 *     - PlayPage.replaySaveDoubleClick.test.tsx — second click is a no-op (W839)
 *     - PlayPage.saveReplayBtnAttr.test.tsx   — `title` tooltip (W1227)
 *     - PlayPage.saveReplayBtnAriaLabel.test.tsx — `aria-label` (W1230)
 *   None of them pin the className styling contract. This test fills
 *   that gap with a single focused assertion.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` win-after-one-move fixture pattern as
 *     the sibling save-replay tests so a single dispatch drops PlayPage
 *     straight into the terminal-win branch that mounts the save button.
 *     `?quickstart=1` skips the setup screen.
 *   - Assert exact-match on the `className` attribute (not `classList`
 *     containment) so a stray accidental extra class would also fail —
 *     this button intentionally has just the one shared pill class, and
 *     adding a button-specific class is a contract change worth a
 *     deliberate test update.
 *   - No click is dispatched: this is about the *static* styling
 *     contract on mount, independent of the saved/unsaved state machine.
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
  const TEST_GAME_ID = "save-replay-btn-classname-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Save Replay Btn ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-save button className.",
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

describe("PlayPage win-banner save-replay button className (W1233)", () => {
  it("renders with the shared play-share-pill class so it groups with sibling share controls", async () => {
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

    // Lock the styling contract: any rename, drop, or accidental extra
    // class on this button causes this assertion to fail.
    expect(saveBtn.className).toBe("play-share-pill");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
