/**
 * Unit test for the PlayPage info popover action-log entry <li> inline
 * `gap` style (W1749).
 *
 * Each rendered action-log entry inside the info popover is an <li>
 * with an inline `style={{ display: "flex", justifyContent: "space-between",
 * gap: 8, padding: "2px 0" }}`. The sibling W1736/W1740 tests pin the
 * flex layout and edge alignment; this test pins the numeric `gap: 8`
 * (serialised by React/jsdom as `"8px"`) so a minimum horizontal
 * breathing-space is always present between the action-type <code>
 * column and the timestamp <span> column.
 *
 * A regression that dropped `gap` (or shrank it to e.g. 0) would let
 * the timestamp butt directly against the action-type label whenever
 * a long action name pushed the flex children together — producing an
 * unreadable run-on row even though `justifyContent: space-between`
 * still pushes the columns to opposite edges.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin that exposes a dispatcher
 *     button so we can append a real action-log entry (the empty-state
 *     "No actions yet." <li> is a separate, intentionally-unstyled node).
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li> (the rendered entry — the
 *     placeholder is no longer in the DOM once entries exist) and
 *     assert its inline `style.gap` is exactly `"8px"`.
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
  const TEST_GAME_ID = "info-action-log-li-gap-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Gap Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <li> gap test.",
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

describe("PlayPage info popover action-log entry <li> gap (W1749)", () => {
  it("renders each action-log entry <li> with inline style.gap exactly '8px' so the action-type and timestamp columns keep a minimum horizontal breathing-space", async () => {
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

    // Pin the inline gap property exactly. React converts the numeric
    // literal `8` to the CSS pixel string "8px"; equality guards against
    // either a dropped property or a relaxed value (e.g. 0).
    expect(entry!.style.gap).toBe("8px");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
