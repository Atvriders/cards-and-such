/**
 * Unit test for the PlayPage info popover action-log entry <li> inline
 * `padding` style (W1752).
 *
 * Each rendered action-log entry inside the info popover is an <li>
 * with an inline `style={{ display: "flex", justifyContent: "space-between",
 * gap: 8, padding: "2px 0" }}`. The sibling W1736/W1740/W1749 tests pin
 * the flex layout, edge alignment, and column gap; this test pins the
 * `padding: "2px 0"` shorthand (serialised by React/jsdom as the
 * normalised "2px 0px") so each row keeps its small vertical breathing
 * space without adding horizontal padding that would push the action
 * type away from the <ol>'s own padding edge.
 *
 * A regression that dropped the padding (or shrank it to 0) would cram
 * adjacent log entries together vertically — making the rolling action
 * log a single dense run-on of text. Conversely, a regression that
 * added horizontal padding would misalign the <code> column relative
 * to the surrounding <ol> padding.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin that exposes a dispatcher
 *     button so we can append a real action-log entry (the empty-state
 *     "No actions yet." <li> is a separate, intentionally-unstyled node).
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li> (the rendered entry — the
 *     placeholder is no longer in the DOM once entries exist) and
 *     assert its inline `style.padding` is exactly `"2px 0px"` (the
 *     normalised form jsdom serialises `"2px 0"` to).
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
  const TEST_GAME_ID = "info-action-log-li-padding-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Padding Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <li> padding test.",
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

describe("PlayPage info popover action-log entry <li> padding (W1752)", () => {
  it("renders each action-log entry <li> with inline style.padding exactly '2px 0px' so the row keeps small vertical breathing-space without adding horizontal padding", async () => {
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

    // Pin the inline padding shorthand exactly. jsdom normalises the
    // source string `"2px 0"` to `"2px 0px"` when serialising the
    // CSSStyleDeclaration; equality guards against either a dropped
    // property or a relaxed value (e.g. 0 / "0").
    expect(entry!.style.padding).toBe("2px 0px");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
