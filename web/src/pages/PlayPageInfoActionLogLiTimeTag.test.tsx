/**
 * Unit test for the PlayPage info popover action-log entry's inner
 * timestamp element tagName === "SPAN" (W1774).
 *
 * Each rendered action-log entry <li> contains two children: a leading
 * <code> with the dispatched action `entry.type`, and a trailing <span>
 * holding the localised timestamp from
 * `new Date(entry.ts).toLocaleTimeString()`. The trailing element's
 * tagName matters because:
 *   - <span> is a phrasing-content inline element with no implicit
 *     semantic weight, which is the right contract for a soft, secondary
 *     timestamp annotation;
 *   - if a regression replaced it with <time>, <code>, <p>, <div>, etc.,
 *     screen-reader semantics, default block-vs-inline layout, and any
 *     `.play-action-log span` CSS selectors would silently break;
 *   - the sibling W1765 test pins the leading <code>, but a swap of the
 *     trailing element would not be caught by any existing assertion.
 *
 * Existing sibling tests pin the entry <li>'s display:flex (W1736),
 * justifyContent (W1740), gap (W1749), padding (W1752), parent identity
 * <ol> (W1755), entry tagName=LI (W1763), and the leading <code> tagName
 * (W1765). None of them assert on the trailing timestamp element's
 * tagName, leaving this regression vector uncovered.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li>'s lastElementChild and assert
 *     its tagName is exactly "SPAN".
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
  const TEST_GAME_ID = "info-action-log-li-time-tag-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Time Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log entry inner timestamp tag test.",
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

describe("PlayPage info popover action-log entry inner timestamp tagName=SPAN (W1774)", () => {
  it("renders each action-log <li>'s trailing timestamp element as a <span> (lastElementChild.tagName === 'SPAN') so phrasing-content semantics and `span`-targeted CSS keep applying", async () => {
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
    // empty-state "No actions yet." <li> has no timestamp child and
    // would not exercise this path.
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

    // The entry's last child is the timestamp element. It must
    // literally be a <span>, not a <time>, <code>, <p>, or <div>.
    // tagName is uppercase per the HTML DOM spec.
    const timestampEl = entry!.lastElementChild as HTMLElement | null;
    expect(timestampEl).toBeTruthy();
    expect(timestampEl!.tagName).toBe("SPAN");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
