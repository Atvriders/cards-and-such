/**
 * Unit test for the PlayPage info popover action-log entry's leading
 * <code> element inline `overflow: "hidden"` (W1799).
 *
 * Each rendered action-log entry <li> uses `display: flex` with two
 * children: a leading <code> styled `flex: "1 1 auto"` so it absorbs
 * leftover width, plus `overflow: "hidden"` and `textOverflow: "ellipsis"`
 * so a long action `type` string clips with an ellipsis instead of
 * breaking the row layout. If the leading <code>'s inline `overflow` is
 * regressed (e.g. dropped, set to `"visible"`, or changed to `"auto"`),
 * a long action-type string would either:
 *   - overflow the column horizontally and visually collide with or
 *     push the trailing timestamp <span> off the row;
 *   - render scrollbars inside the <code>, breaking the read-only,
 *     single-line, ellipsised contract the popover relies on.
 *
 * Existing sibling tests pin the entry <li>'s display:flex (W1736),
 * justifyContent (W1740), gap (W1749), padding (W1752), the leading
 * child's tagName=CODE (W1765), its flex 1 1 auto (W1793), the
 * trailing <span>'s tagName=SPAN (W1774), opacity 0.7 (W1779), and
 * flex 0 0 auto (W1787). None of these assert that the <code>'s own
 * inline `overflow` is exactly `"hidden"`, which is the contract that
 * makes the action-type column clip rather than overflow.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li>'s firstElementChild (the
 *     leading <code>) and assert its inline `style.overflow` is exactly
 *     "hidden".
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
  const TEST_GAME_ID = "info-action-log-code-overflow-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Code Overflow Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for action-log entry leading <code> overflow test.",
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

describe("PlayPage info popover action-log entry leading <code> inline overflow='hidden' (W1799)", () => {
  it("styles the action-log entry's leading <code> with `overflow: 'hidden'` so long action-type strings clip rather than overflow the row", async () => {
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
    // empty-state "No actions yet." <li> has no <code> child and would
    // not exercise this path.
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

    // The leading child is the <code> action-type element. Assert its
    // inline `overflow` is exactly "hidden" so a long action-type string
    // clips inside the column rather than overflowing horizontally.
    const codeEl = entry!.firstElementChild as HTMLElement | null;
    expect(codeEl).toBeTruthy();
    expect(codeEl!.tagName).toBe("CODE");
    expect(codeEl!.style.overflow).toBe("hidden");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
