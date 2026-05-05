/**
 * Unit test for the PlayPage info popover action-log entry tagName === "LI"
 * (W1763).
 *
 * Each rendered action-log entry inside the info popover is rendered as
 * an <li> element. The entry must literally be an HTML list item (tagName
 * "LI") so the surrounding <ol data-testid="play-action-log"> renders
 * semantically as an ordered list of items, list-item ARIA semantics work
 * for assistive tech, and any future CSS targeting `.play-action-log > li`
 * (or generic `li` selectors) continues to apply.
 *
 * Existing sibling tests pin the entry's display:flex (W1736),
 * justifyContent (W1740), gap (W1749), padding (W1752), and the entry's
 * direct parent identity (W1755 — parent is the <ol>). None of those
 * assert the entry's own tagName. A regression that swapped <li> for
 * <div role="listitem"> or <p> would silently break list semantics while
 * leaving the parent-identity test green (because the parent <ol> is
 * resolved by data-testid, not by structure).
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li> via the <ol>'s firstElementChild
 *     and assert its tagName is exactly "LI".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-li-tag-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <li> tagName test.",
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

describe("PlayPage info popover action-log entry tagName=LI (W1763)", () => {
  it("renders each action-log entry as a real <li> element (tagName === 'LI') so list semantics and `li`-targeted CSS keep working", async () => {
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
    const entry = log.firstElementChild as HTMLElement | null;
    expect(entry).toBeTruthy();

    // The entry must literally be an <li>, not a <div role="listitem"> or
    // any other element. tagName is uppercase per the HTML DOM spec.
    expect(entry!.tagName).toBe("LI");
  });
});

void React;
