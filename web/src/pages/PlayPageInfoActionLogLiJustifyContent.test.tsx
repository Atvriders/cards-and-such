/**
 * Unit test for the PlayPage info popover action-log entry <li> inline
 * `justifyContent` style (W1740).
 *
 * Each rendered action-log entry inside the info popover is an <li>
 * with an inline `style={{ display: "flex", justifyContent: "space-between",
 * gap: 8, padding: "2px 0" }}`. The sibling W1736 test pins
 * `display: "flex"`; this test pins `justifyContent: "space-between"` so
 * the action-type <code> and timestamp <span> are pushed to opposite
 * ends of the row instead of clumping at the start.
 *
 * A regression that dropped `justifyContent` (or relaxed it to e.g.
 * `flex-start`) would visually collapse the timestamp against the
 * action-type, breaking the two-column readout.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin that exposes a dispatcher
 *     button so we can append a real action-log entry (the empty-state
 *     "No actions yet." <li> is a separate, intentionally-unstyled node).
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li> (the rendered entry — the
 *     placeholder is no longer in the DOM once entries exist) and
 *     assert its inline `style.justifyContent` is exactly
 *     `"space-between"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — exposes a dispatch button so the test can push
// a known entry into the action log without depending on real game logic.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-li-justify-content-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Justify Content Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <li> justifyContent test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-dispatch"
          type="button"
          onClick={() => dispatch({ type: "fx-action" })}
        >
          dispatch
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
// render side-effect-free even though we never reach the win banner.
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

describe("PlayPage info popover action-log entry <li> justifyContent (W1740)", () => {
  it("renders each action-log entry <li> with inline style.justifyContent exactly 'space-between' so action-type and timestamp sit at opposite edges", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the fixture mounts and the info button is
    // reachable.
    fireEvent.click(screen.getByTestId("start-game"));

    // Dispatch one action so the action log has a real entry — the
    // empty-state "No actions yet." <li> is a separate node and would
    // not exercise the styled entry path.
    fireEvent.click(screen.getByTestId("fx-dispatch"));

    // Open the info popover so the <details>/<ol> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Resolve the first rendered entry <li> inside the action-log <ol>.
    // Once entries exist, the empty-state placeholder is no longer in
    // the DOM, so the first <li> is guaranteed to be the styled entry.
    const log = screen.getByTestId("play-action-log") as HTMLOListElement;
    const entry = log.querySelector("li") as HTMLLIElement | null;
    expect(entry).toBeTruthy();

    // Pin the inline justifyContent property exactly. React serialises
    // the string "space-between" verbatim, so equality guards against
    // either a dropped property or a relaxed value (e.g. flex-start).
    expect(entry!.style.justifyContent).toBe("space-between");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
