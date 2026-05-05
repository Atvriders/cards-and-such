/**
 * Unit test for the PlayPage info popover action-log entry's leading
 * <code> element inline `textOverflow: "ellipsis"` (W1805).
 *
 * Each rendered action-log entry <li> uses `display: flex` with a
 * leading <code> sized `flex: "1 1 auto"` (W1793) and clipped via
 * `overflow: "hidden"` (W1799). Those two properties are necessary
 * but not sufficient: without `textOverflow: "ellipsis"`, an
 * over-long action-type string would still be cut off mid-glyph
 * with no visual cue that the value is truncated, and screen-reader
 * users / debuggers would have no way to tell the rendered text is
 * partial. The trailing ellipsis is the user-facing contract that
 * differentiates "string fits" from "string was clipped".
 *
 * Existing sibling tests pin tagName=CODE (W1765), flex 1 1 auto
 * (W1793), and overflow hidden (W1799) — but none of them assert
 * that the leading <code>'s own inline `textOverflow` is exactly
 * "ellipsis". A regression that drops textOverflow (or sets it to
 * "clip") would silently break the truncation indicator while
 * leaving every other styling test green.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li>'s firstElementChild (the
 *     leading <code>) and assert its inline `style.textOverflow`
 *     is exactly "ellipsis".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-code-ellipsis-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Code Ellipsis Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for action-log entry leading <code> textOverflow test.",
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

describe("PlayPage info popover action-log entry leading <code> inline textOverflow='ellipsis' (W1805)", () => {
  it("styles the action-log entry's leading <code> with `textOverflow: 'ellipsis'` so clipped action-type strings show a trailing ellipsis indicator", async () => {
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

    const codeEl = entry!.firstElementChild as HTMLElement | null;
    expect(codeEl).toBeTruthy();
    expect(codeEl!.tagName).toBe("CODE");
    expect(codeEl!.style.textOverflow).toBe("ellipsis");
  });
});

void React;
