/**
 * Unit test for the PlayPage info popover action-log entry <li>'s
 * parent relationship (W1755).
 *
 * Each rendered action-log entry inside the info popover is an <li>
 * whose immediate parent is the <ol data-testid="play-action-log">
 * element. The action-log entry must be a direct child of the <ol>
 * (no wrapper <div> or <ul> in between) so the listStyle/fontSize/
 * overflow rules on the <ol> apply, and so the rendered output is
 * semantically a list item inside an ordered list.
 *
 * Existing sibling tests pin the entry's display:flex (W1736),
 * justifyContent (W1740), gap (W1749), and padding (W1752), plus
 * the surrounding <ol>'s className/margin/padding/listStyle/
 * fontSize/maxHeight/overflowY — but none assert that the entry
 * <li>'s parent is the action-log <ol>. A regression that wrapped
 * each entry in an extra container would silently break list
 * semantics and any future CSS that targets `.play-action-log > li`.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li> and assert its parentElement
 *     is the <ol> with data-testid="play-action-log".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-li-parent-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Parent Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <li> parent relationship test.",
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

describe("PlayPage info popover action-log entry <li> parent (W1755)", () => {
  it("renders each action-log entry <li> as a direct child of the <ol data-testid='play-action-log'> so list semantics and CSS targeting `.play-action-log > li` keep working", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("fx-dispatch"));
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    const log = screen.getByTestId("play-action-log") as HTMLOListElement;
    const entry = log.querySelector("li") as HTMLLIElement | null;
    expect(entry).toBeTruthy();

    // The entry's immediate parent must be the action-log <ol> itself,
    // not some intermediate wrapper. Identity check against the same
    // node we resolved by testid pins the direct parent-child link.
    expect(entry!.parentElement).toBe(log);
  });
});

void React;
