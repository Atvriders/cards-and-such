/**
 * Unit test for the PlayPage info popover Action log (W208).
 *
 * The action log is a rolling debug breadcrumb (cap = 10) appended to on
 * every dispatch — even reducer no-ops — and rendered inside the info
 * popover under the `<details data-testid="play-action-log">` list. Each
 * <li> is one entry, newest first (the source slice()s + reverse()s).
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin whose component wires three
 *     buttons to the injected `dispatch` prop, one per distinct action
 *     type. The hoisted block is required because the vi.mock factory
 *     for ../games/registry.js runs before module-level consts initialise.
 *   - Click `start-game` to enter playing phase.
 *   - Fire the three dispatcher buttons in order (draw, flip, move).
 *   - Open the info popover via `play-info-btn`.
 *   - Assert the `play-action-log` <ol> contains exactly three <li>s
 *     whose `<code>` text matches the dispatched action types in
 *     reverse-chronological order (newest first).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Three dispatcher buttons let the test push a known
// sequence of action types into the rolling log. The reducer is a no-op
// — the action log appends regardless of whether reducer state changes.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "action-log-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Action Log Fixture",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log popover tests.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (s: { moves: number }) => s,
    isTerminal: () => null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-draw"
          type="button"
          onClick={() => dispatch({ type: "draw-card" })}
        >
          draw
        </button>
        <button
          data-testid="fx-flip"
          type="button"
          onClick={() => dispatch({ type: "flip-card" })}
        >
          flip
        </button>
        <button
          data-testid="fx-move"
          type="button"
          onClick={() => dispatch({ type: "move-card" })}
        >
          move
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

describe("PlayPage info popover action log (W208)", () => {
  it("records the last 3 dispatched action types in the play-action-log details", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the fixture's dispatch-wired buttons
    // mount and the info button is reachable.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-draw")).toBeTruthy();

    // Dispatch three distinct action types in known order. The action
    // log appends every dispatch regardless of reducer behaviour.
    fireEvent.click(screen.getByTestId("fx-draw"));
    fireEvent.click(screen.getByTestId("fx-flip"));
    fireEvent.click(screen.getByTestId("fx-move"));

    // Open the info popover so the action-log <details> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Pull the action-log <ol> and read each entry's <code> text. The
    // source renders newest first via .slice().reverse(), so the visual
    // order is move -> flip -> draw.
    const log = screen.getByTestId("play-action-log");
    const codes = Array.from(log.querySelectorAll("li code")).map(
      (el) => el.textContent?.trim() ?? "",
    );
    expect(codes).toEqual(["move-card", "flip-card", "draw-card"]);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
