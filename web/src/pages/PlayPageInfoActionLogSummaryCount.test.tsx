/**
 * Unit test for the PlayPage info popover action-log <summary> entry-count
 * reflecting the live actionLog.length after multiple non-cap dispatches
 * (W1813).
 *
 * The action-log section header is rendered as:
 *
 *     <summary>Action log ({actionLog.length})</summary>
 *
 * so the parenthesised number must track the live `actionLog.length` value.
 * The existing W208 cap test asserts the saturation case ("Action log (10)"
 * after 12 dispatches), and the W1088 collapsed-default test asserts the
 * label appears at all, but neither pins the count for a strictly-below-cap
 * dispatch sequence. A regression that hard-coded the count, mis-counted by
 * one (e.g. printed actionLog.length-1 from a stale `slice`), or rendered
 * the cap value (10) regardless of the live length would slip past every
 * existing test in the action-log family.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a single dispatch button.
 *   - Click `start-game`, dispatch exactly 3 actions (well under the 10 cap).
 *   - Open the info popover and read the <summary> textContent.
 *   - Assert it contains the literal "Action log (3)" — the parenthesised
 *     "3" pins the live count, distinct from the cap value (10) covered
 *     elsewhere.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-summary-count-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Summary Count Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log summary count test.",
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

describe("PlayPage info popover action-log summary count (W1813)", () => {
  it("reports the live actionLog.length in the <summary> after 3 (sub-cap) dispatches as 'Action log (3)'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));

    // Three dispatches — strictly below the 10-entry cap so we are
    // pinning the live count (not the saturated cap value covered by W208).
    fireEvent.click(screen.getByTestId("fx-dispatch"));
    fireEvent.click(screen.getByTestId("fx-dispatch"));
    fireEvent.click(screen.getByTestId("fx-dispatch"));

    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    const log = screen.getByTestId("play-action-log");
    const summary = log.parentElement?.querySelector("summary");
    expect(summary).toBeTruthy();
    expect(summary!.textContent ?? "").toContain("Action log (3)");
  });
});

void React;
