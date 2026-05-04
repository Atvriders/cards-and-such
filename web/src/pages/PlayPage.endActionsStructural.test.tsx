/**
 * Structural test for the PlayPage `.end-actions` button row (W1080).
 *
 * Observable behavior:
 *   When the round reaches a terminal-win/loss, PlayPage.tsx (~line 2720)
 *   renders a `<div className="end-actions">` row inside the
 *   `[data-testid="end-panel"]` section. The row wraps the three primary
 *   end-panel CTAs — "New Game" (`new-game-btn`), "Replay"
 *   (`replay-btn`), and the lobby back-link (`end-back-btn`). The
 *   `.end-actions` class anchors the flex layout, gap, wrap behaviour,
 *   and responsive button sizing in PlayPage.css. A rename or removal
 *   would silently strip the row's layout while every neighbouring
 *   end-panel test (which keys off testids, not the wrapper class)
 *   continued to pass.
 *
 *   Sibling tests pin the buttons themselves (W822 `endNewGameBtn`,
 *   W813 `endBackBtn`, etc.) but no existing test pins the `.end-actions`
 *   wrapper class — an exhaustive grep across the test suite turned up
 *   only doc-comment mentions, never a `classList.contains("end-actions")`
 *   or `querySelector(".end-actions")` assertion. This test fills that
 *   gap with the minimum surface: drive the round to terminal-win, locate
 *   the wrapper by its CSS class, and pin both the class itself and the
 *   structural invariant that the three end-panel CTAs live inside it.
 *
 * Strategy mirrors W822 (PlayPage.endNewGameBtn.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal` to
 *     a positive-score payload after one dispatch — enough to drive
 *     PlayPage into the terminal-win branch where the end-panel mounts.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, then locate `.end-actions` via
 *     querySelector and assert (a) the class is present, (b) it lives
 *     inside the end-panel, and (c) it contains the three primary CTAs.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-actions-structural-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Actions Structural Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-actions structural test.",
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

describe("PlayPage .end-actions button row (W1080)", () => {
  it("renders an .end-actions wrapper inside the end-panel containing the three primary CTAs", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the end-panel (and therefore .end-actions) is not
    // mounted before the round terminates — both live behind the
    // `phase === "ended" && finalScore !== null` render gate.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(container.querySelector(".end-actions")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel).toBeTruthy();

    const endActions = container.querySelector(".end-actions");

    // Pin existence — a rename here detaches every .end-actions rule in
    // PlayPage.css (flex layout, gap, wrap, responsive button sizing).
    expect(endActions).not.toBeNull();
    // Pin the bare class — CSS rules key off the exact selector.
    expect(endActions?.classList.contains("end-actions")).toBe(true);
    // Pin the structural relationship: .end-actions is a descendant of
    // the end-panel section. A regression that hoisted it out of the
    // panel would break the contained layout context the CSS assumes.
    expect(endPanel.contains(endActions as Node)).toBe(true);
    // Pin the load-bearing children: the three primary CTAs the row was
    // built to lay out. Sibling tests pin each button by testid; this
    // assertion pins the *grouping* — i.e. that they share the wrapper.
    expect(endActions?.querySelector('[data-testid="new-game-btn"]')).not.toBeNull();
    expect(endActions?.querySelector('[data-testid="replay-btn"]')).not.toBeNull();
    expect(endActions?.querySelector('[data-testid="end-back-btn"]')).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
