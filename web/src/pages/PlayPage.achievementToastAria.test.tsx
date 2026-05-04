/**
 * Unit test for PlayPage achievement-unlock toast assistive-tech surface (W944).
 *
 * Existing coverage adjacent to this region of PlayPage:
 *   - `PlayPage.recordGameBestNoRegress.test.tsx` (W700) — exercises the
 *     `recordWithAchievementToast` callback for its STORAGE side-effect
 *     (perGame.best no-regression), but never asserts the rendered toast.
 *   - `PlayPage.timerPausedAria.test.tsx` (W917) — paused-state aria-label
 *     pattern reused as a stylistic template here.
 *   - `PlayPage.winBannerAriaLabel.test.tsx` — win-banner role/aria-label,
 *     a sibling render branch but a wholly different element + label shape.
 *
 * What this test adds (W944): the assistive-tech surface of the
 * `play-achievement-toast` element rendered at PlayPage.tsx:2588-2618.
 * Three a11y contracts live on that markup with ZERO existing tests:
 *
 *   1. `role="status"` — announces non-modal advisory content.
 *   2. `aria-live="polite"` — coalesces the announcement so it doesn't
 *      interrupt in-flight screen-reader speech (the unlock is celebratory,
 *      not safety-critical).
 *   3. `aria-label` of the form
 *      `Achievement unlocked: <title>. <description>. Press to dismiss.`
 *      — this is the FULL spoken text; the visible <span> only includes
 *      the title, so screen-reader users would lose `description` and
 *      the dismiss hint without this dedicated label. A regression that
 *      dropped the description (or the "Press to dismiss." trailer) would
 *      go silent without an explicit assertion.
 *
 * Trigger strategy: a fresh stats blob (zero wins) + a fixture plugin
 * whose `isTerminal` returns a winning score after one dispatch unlocks
 * the `first-win` achievement (`isUnlocked: (s) => s.totalWins >= 1`).
 * `recordWithAchievementToast` then features that unlock as the toast
 * payload (PlayPage.tsx:1143-1144), giving us a deterministic, single-
 * round path to the rendered button. We do NOT exercise the 5s auto-
 * dismiss timer or the click-to-dismiss handler — both are out of scope
 * for an a11y-attribute focused W-test.
 *
 * Scope discipline: ONE behavior, ONE element, three attributes that all
 * belong to the same a11y contract for the same node — splitting them
 * across three tests would just slow CI for the same single render.
 *
 * Harness mirrors PlayPage.recordGameBestNoRegress.test.tsx:
 *   - `vi.hoisted` registers a fixture plugin that wins on one click.
 *   - Confetti is null-stubbed because jsdom lacks canvas APIs and the
 *     win path emits a sparkles burst.
 *   - `?quickstart=1` skips the setup screen, landing directly in play.
 *   - Real timers — we never advance the clock.
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
  const TEST_GAME_ID = "achievement-toast-aria-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Achievement Toast Aria Fixture",
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

describe("PlayPage achievement-toast a11y attributes (W944)", () => {
  it("renders role=status, aria-live=polite, and full aria-label including description + dismiss hint", async () => {
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

    const toast = screen.getByTestId("play-achievement-toast");

    // (1) role=status — non-modal advisory live region.
    expect(toast.getAttribute("role")).toBe("status");

    // (2) aria-live=polite — coalesce the announcement so it doesn't
    // interrupt in-flight screen-reader speech.
    expect(toast.getAttribute("aria-live")).toBe("polite");

    // (3) aria-label is the FULL spoken text. The visible span only
    // shows the title, so the description + dismiss hint exist solely
    // on this attribute. We assert the canonical first-win unlock copy
    // verbatim — a regression that dropped the description or the
    // "Press to dismiss." trailer would go silent without this check.
    expect(toast.getAttribute("aria-label")).toBe(
      "Achievement unlocked: First Win. Win your first game.. Press to dismiss.",
    );
  });
});

// Reference React so this file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
