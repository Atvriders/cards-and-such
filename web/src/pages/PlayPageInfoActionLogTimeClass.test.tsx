/**
 * Unit test for the PlayPage info popover action-log entry trailing
 * timestamp <span>'s inline `opacity` style (W1779).
 *
 * Each rendered action-log entry <li> contains two children: a leading
 * <code> with the dispatched `entry.type`, and a trailing <span>
 * holding the localised timestamp. The trailing <span> carries an
 * inline `opacity: 0.7` style — a deliberate visual de-emphasis so
 * that the action *type* stays the prominent column and the timestamp
 * reads as soft secondary metadata. If a regression dropped, raised,
 * or zeroed this opacity, the action log would either look cluttered
 * (timestamps competing with action names) or invisible (opacity 0),
 * and no existing assertion would catch the change.
 *
 * Existing sibling tests pin the entry <li>'s display:flex (W1736),
 * justifyContent (W1740), gap (W1749), padding (W1752), parent <ol>
 * identity (W1755), entry tagName=LI (W1763), the leading <code>'s
 * tagName (W1765), and the trailing element's tagName=SPAN (W1774).
 * None of them inspect the timestamp <span>'s inline `opacity` value,
 * leaving this visual-hierarchy contract uncovered.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li>'s lastElementChild (the
 *     timestamp <span>) and assert its `style.opacity` parses to 0.7.
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
  const TEST_GAME_ID = "info-action-log-time-class-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Time Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log timestamp span opacity test.",
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

describe("PlayPage info popover action-log timestamp span inline opacity (W1779)", () => {
  it("renders the trailing timestamp <span> with inline opacity:0.7 so the timestamp reads as de-emphasised secondary metadata next to the action type", async () => {
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

    // Resolve the first rendered entry <li>'s trailing timestamp
    // <span>. Once entries exist, the empty-state placeholder is no
    // longer in the DOM, so the first <li> is guaranteed to be the
    // styled entry.
    const log = screen.getByTestId("play-action-log") as HTMLOListElement;
    const entry = log.querySelector("li") as HTMLLIElement | null;
    expect(entry).toBeTruthy();
    const timestampEl = entry!.lastElementChild as HTMLElement | null;
    expect(timestampEl).toBeTruthy();
    expect(timestampEl!.tagName).toBe("SPAN");

    // Inline `opacity: 0.7` is what React serialises into the style
    // attribute. Parse to a number so we are robust to "0.7" vs ".7"
    // string normalisation across jsdom versions.
    const opacity = parseFloat(timestampEl!.style.opacity);
    expect(opacity).toBeCloseTo(0.7, 5);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
