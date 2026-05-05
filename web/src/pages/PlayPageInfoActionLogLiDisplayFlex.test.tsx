/**
 * Unit test for the PlayPage info popover action-log entry <li> inline
 * `display` style (W1736).
 *
 * Each rendered action-log entry inside the info popover is an <li>
 * with an inline `style={{ display: "flex", justifyContent: "space-between",
 * gap: 8, padding: "2px 0" }}` so the action-type <code> and timestamp
 * <span> sit on a single line, pushed to opposite edges of the row.
 *
 * Existing sibling tests pin the surrounding <ol>'s className, margin,
 * padding, listStyle, fontSize, max-height, overflowY, the <details>
 * summary cursor/className, and the empty-state copy — but none assert
 * the entry <li>'s inline `display: flex`. A regression that dropped
 * the property would let the entries default to block layout, breaking
 * the action-type / timestamp two-column visual.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin that exposes a dispatcher
 *     button so we can append a real action-log entry (the empty-state
 *     "No actions yet." <li> is a different node and intentionally
 *     unstyled).
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li> (the rendered entry — not the
 *     empty-state placeholder, which doesn't appear once entries exist)
 *     and assert its inline `style.display` is exactly `"flex"`.
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
  const TEST_GAME_ID = "info-action-log-li-display-flex-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Display Flex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <li> display:flex test.",
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

describe("PlayPage info popover action-log entry <li> display:flex (W1736)", () => {
  it("renders each action-log entry <li> with inline style.display exactly 'flex' so action-type and timestamp share a single row", async () => {
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

    // Pin the inline display property exactly. React serialises the
    // string "flex" verbatim, so equality guards against either a
    // dropped property (default block) or a relaxed value.
    expect(entry!.style.display).toBe("flex");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
