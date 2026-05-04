/**
 * Unit test for PlayPage achievement-unlock toast click-to-dismiss (W957).
 *
 * Existing coverage adjacent to this region of PlayPage:
 *   - `PlayPage.achievementToastAria.test.tsx` (W944) — covers the a11y
 *     attribute surface on the `play-achievement-toast` element
 *     (role=status, aria-live=polite, aria-label with dismiss hint).
 *     That test deliberately does NOT exercise the click handler — it
 *     left the tap-to-dismiss interaction uncovered.
 *   - `PlayPage.recordGameBestNoRegress.test.tsx` (W700) — exercises
 *     the storage side-effect of `recordWithAchievementToast` but never
 *     touches the rendered toast or its dismiss handler.
 *
 * What this test adds (W957): the `onClick` handler at PlayPage.tsx:2597-2607
 * which clears the auto-hide timer and calls `setPlayAchievementToast(null)`.
 * The aria-label promises "Press to dismiss." (asserted by W944); this test
 * verifies that promise actually wires up — pressing the toast unmounts it.
 *
 * Trigger strategy mirrors W944 verbatim: a fresh stats blob (zero wins)
 * + a fixture plugin whose `isTerminal` returns a winning score after one
 * dispatch unlocks `first-win`, which `recordWithAchievementToast` then
 * features as the toast payload (PlayPage.tsx:1143-1144). Once mounted,
 * we click the button and assert it leaves the DOM.
 *
 * Scope discipline: ONE behavior — click dismisses. We do NOT test the
 * 5s auto-hide timer (separate code path, would require fake timers) and
 * we do NOT re-assert the a11y attributes (W944 owns those).
 *
 * Harness mirrors PlayPage.achievementToastAria.test.tsx:
 *   - `vi.hoisted` registers the same fixture plugin shape.
 *   - Confetti is null-stubbed because jsdom lacks canvas APIs and the
 *     win path emits a sparkles burst.
 *   - `?quickstart=1` skips the setup screen, landing directly in play.
 *   - Real timers — we never advance the clock; the click should
 *     synchronously schedule the unmount via React state.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload once `moves >= 1`. PlayPage interprets
// `term.score > 0` as a win, so a single dispatch drives the
// `recordWithAchievementToast(score, true, elapsed)` branch — which, on
// a fresh stats blob, unlocks `first-win` and features it as the toast.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "achievement-toast-dismiss-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Achievement Toast Dismiss Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin to drive a first-win achievement unlock.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 1 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-win"
          type="button"
          onClick={() => dispatch({ type: "win-now" })}
        >
          win
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
// win-path render side-effect-free.
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

describe("PlayPage achievement-toast click-to-dismiss (W957)", () => {
  it("unmounts the toast when the user clicks it", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the single-click win — terminal-win branch fires
    // recordWithAchievementToast, which on a fresh stats blob unlocks
    // `first-win` and surfaces it as the play-page-scoped toast.
    fireEvent.click(screen.getByTestId("fx-win"));

    // Precondition: toast mounted. (W944 already asserts its a11y
    // attributes; here we only need a handle to click.)
    const toast = screen.getByTestId("play-achievement-toast");

    // Act: tap-to-dismiss. The onClick handler clears the auto-hide
    // timer and sets `playAchievementToast` back to null, which makes
    // the conditional render at PlayPage.tsx:2588 stop emitting the
    // button.
    fireEvent.click(toast);

    // Postcondition: toast is gone from the DOM. Using queryByTestId
    // (not getByTestId) so absence is the assertion shape — getByTestId
    // would throw with its own error message before our matcher ran.
    expect(screen.queryByTestId("play-achievement-toast")).toBeNull();
  });
});

// Reference React so this file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
