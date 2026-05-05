/**
 * Unit test for the PlayPage info popover action-log entry trailing
 * timestamp <span>'s inline `flex` style — specifically the
 * "0 0 auto" shorthand (W1787).
 *
 * Each rendered action-log entry <li> is a flex row containing two
 * children: a leading <code> styled `flex: "1 1 auto"` so it absorbs
 * any leftover width and ellipsises long action names, and a trailing
 * <span> styled `flex: "0 0 auto"` so the localised timestamp keeps
 * its intrinsic width and never gets squeezed. If a regression flipped
 * the trailing <span> to `1 1 auto`, `1 0 auto`, or omitted the flex
 * declaration, the timestamp could either:
 *   - shrink below its rendered width and clip/ellipsise (losing the
 *     final digit/AM-PM marker), or
 *   - grow and push the action <code> off-screen, defeating the whole
 *     two-column layout.
 *
 * Existing sibling tests pin the entry <li>'s display:flex (W1736),
 * justifyContent (W1740), gap (W1749), padding (W1752), parent <ol>
 * identity (W1755), entry tagName=LI (W1763), the leading <code>'s
 * tagName (W1765), the trailing element's tagName=SPAN (W1774), and
 * the trailing <span>'s opacity:0.7 (W1779). None of them inspect the
 * timestamp <span>'s `flex` shorthand, leaving the
 * "fixed-width column" contract uncovered.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li>'s lastElementChild (the
 *     timestamp <span>) and assert its `style.flex` is "0 0 auto".
 *     jsdom preserves React's inline shorthand verbatim, so a strict
 *     equality check is sufficient and catches any change in any of
 *     the three flex sub-values (grow / shrink / basis).
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
  const TEST_GAME_ID = "info-action-log-time-flex-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Time Flex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log timestamp flex style test.",
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

describe("PlayPage info popover action-log timestamp <span> inline flex='0 0 auto' (W1787)", () => {
  it("renders the trailing timestamp <span> with style.flex === '0 0 auto' so the timestamp column keeps its intrinsic width and never grows or shrinks", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the fixture mounts and the info button
    // is reachable.
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

    // The entry's last child is the timestamp <span>. Its inline
    // `flex` shorthand pins the timestamp to its intrinsic width.
    const timestampEl = entry!.lastElementChild as HTMLElement | null;
    expect(timestampEl).toBeTruthy();
    expect(timestampEl!.tagName).toBe("SPAN");
    expect(timestampEl!.style.flex).toBe("0 0 auto");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
