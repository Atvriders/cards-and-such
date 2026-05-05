/**
 * Unit test for the PlayPage info popover action-log entry's inner
 * action-type element tagName === "CODE" (W1765).
 *
 * Each rendered action-log entry <li> contains two children: a leading
 * <code> element holding the dispatched action `entry.type`, and a
 * trailing <span> with the localised timestamp. The <code> tagName
 * matters because:
 *   - it gives the action-type a monospaced default rendering, which is
 *     the visual contract for "this is a literal action identifier"
 *     rather than prose;
 *   - any future CSS targeting `.play-action-log code` (e.g. font
 *     overrides, copy-on-hover affordances) depends on the element being
 *     a real <code>, not a generic <span>.
 *
 * Existing sibling tests pin the entry <li>'s display:flex (W1736),
 * justifyContent (W1740), gap (W1749), padding (W1752), the parent
 * identity as the <ol> (W1755), and the entry's own tagName=LI (W1763).
 * `PlayPage.actionLog.test.tsx` reads the <code> *textContent* via
 * `querySelectorAll("li code")`, but if a regression replaced <code>
 * with <span>, that selector-based assertion would silently return an
 * empty list and the textContent equality would change shape — none of
 * the green tests would catch the tagName change directly.
 *
 * Strategy:
 *   - Mount PlayPage with a fixture plugin exposing a dispatch button.
 *   - Click `start-game`, dispatch one action, open the info popover.
 *   - Resolve the first action-log <li>'s firstElementChild and assert
 *     its tagName is exactly "CODE".
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
  const TEST_GAME_ID = "info-action-log-li-code-tag-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Li Code Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log entry inner <code> tag test.",
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

describe("PlayPage info popover action-log entry inner action-type tagName=CODE (W1765)", () => {
  it("renders each action-log <li>'s leading action-type element as a real <code> (firstElementChild.tagName === 'CODE') so monospaced styling and `code`-targeted CSS keep applying", async () => {
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

    // The entry's first child is the action-type element. It must
    // literally be a <code>, not a <span> or <div>. tagName is
    // uppercase per the HTML DOM spec.
    const actionTypeEl = entry!.firstElementChild as HTMLElement | null;
    expect(actionTypeEl).toBeTruthy();
    expect(actionTypeEl!.tagName).toBe("CODE");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
