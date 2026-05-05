/**
 * Unit test for the PlayPage info popover action-log entry's leading
 * <code> element inline `flex: "1 1 auto"` (W1793).
 *
 * Each rendered action-log entry <li> uses `display: flex` with two
 * children: a leading <code> styled `flex: "1 1 auto"` so it absorbs
 * any leftover horizontal space (and ellipsises long action names),
 * and a trailing <span> styled `flex: "0 0 auto"` so the timestamp
 * never shrinks. If the leading <code>'s flex grow/shrink/basis is
 * regressed (e.g. dropped to `1 1 0`, set to `0 0 auto`, or removed
 * entirely), the action-type column would either:
 *   - stop expanding to fill available width, leaving an awkward gap
 *     between the action-type and timestamp;
 *   - shrink unpredictably, causing the timestamp to wrap or overflow.
 *
 * Existing sibling tests pin the entry <li>'s display:flex (W1736),
 * justifyContent (W1740), gap (W1749), padding (W1752), the leading
 * child's tagName=CODE (W1765), the trailing <span>'s tagName=SPAN
 * (W1774), opacity 0.7 (W1779), and flex 0 0 auto (W1787). None of
 * these assert that the <code>'s own `flex` shorthand is exactly
 * "1 1 auto", which is the contract that makes the action-type column
 * fluid while the timestamp stays fixed.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li>'s firstElementChild (the
 *     leading <code>) and assert its inline `style.flex` is exactly
 *     "1 1 auto".
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
  const TEST_GAME_ID = "info-action-log-code-flex-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Code Flex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log entry leading <code> flex test.",
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

describe("PlayPage info popover action-log entry leading <code> inline flex='1 1 auto' (W1793)", () => {
  it("styles the action-log entry's leading <code> with `flex: '1 1 auto'` so the action-type column expands to fill leftover width while the timestamp stays fixed", async () => {
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
    // inline `flex` shorthand is exactly "1 1 auto" so the action-type
    // column fluidly absorbs leftover width.
    const codeEl = entry!.firstElementChild as HTMLElement | null;
    expect(codeEl).toBeTruthy();
    expect(codeEl!.tagName).toBe("CODE");
    expect(codeEl!.style.flex).toBe("1 1 auto");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
