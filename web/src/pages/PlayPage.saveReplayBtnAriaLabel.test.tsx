/**
 * Unit test for the win-banner save-replay button aria-label (W1230).
 *
 * Observable behavior:
 *   The `play-save-replay` button rendered inside the win banner carries
 *   an `aria-label="Save replay"` attribute (PlayPage.tsx ~line 2801).
 *   Screen readers announce this label in place of the visible text,
 *   which flips between "Save replay" and "Replay saved" based on
 *   `replaySaved` state. Because the visible text changes, the
 *   aria-label is what gives assistive-tech users a stable, predictable
 *   announcement for the button's purpose. A regression that drops or
 *   renames the attribute (e.g. `aria-label="Save"` typo, removed
 *   during a refactor) would silently degrade screen-reader UX with no
 *   visible smoke.
 *
 *   PlayPage.replaySaveLabel.test.tsx covers the visible textContent
 *   flip; this test pins the accessibility surface — a candidate
 *   noted on W1227 alongside the title attribute coverage.
 *
 * Strategy:
 *   - Reuse the same `vi.hoisted` win-after-one-move fixture pattern
 *     as the sibling replay-save tests so a single dispatch drops
 *     PlayPage straight into the terminal-win branch that mounts the
 *     save button. Drive `?quickstart=1` to skip the setup screen.
 *   - Assert on `getAttribute("aria-label")` rather than role/name
 *     queries so the assertion is unambiguously about the attribute
 *     itself, not the accessible-name computation that could fall
 *     back to text content if the attribute were missing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage into the terminal-win branch
// that exposes the `play-save-replay` button. Same shape as the sibling
// replay-save tests so any future fixture-level change there is easy
// to mirror here.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "save-replay-aria-label-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Save Replay Aria Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for save-replay button aria-label pin.",
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
// terminal-win render side-effect-free, mirroring the sibling tests.
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

describe("PlayPage win-banner save-replay button aria-label (W1230)", () => {
  it("exposes aria-label='Save replay' on the play-save-replay button", async () => {
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

    // Drive the round to terminal-win so the save button mounts. The
    // quickstart flag means setup is skipped entirely; this is the
    // only click we need to reach `isWin`.
    fireEvent.click(screen.getByTestId("fx-win"));

    const saveBtn = screen.getByTestId("play-save-replay");

    // The aria-label is what screen readers announce. Pinning the
    // exact attribute value (not just presence) catches typo
    // regressions like "Save" or "save replay" (lowercase).
    expect(saveBtn.getAttribute("aria-label")).toBe("Save replay");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
