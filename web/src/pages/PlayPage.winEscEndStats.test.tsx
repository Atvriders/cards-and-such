/**
 * Unit test for the PlayPage end-panel after the win-banner is Esc-dismissed (W848).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1471) installs a window keydown listener while
 *   `showWinBanner` is true. On Escape it calls `setBannerDismissed(true)`,
 *   which flips `showWinBanner` from true to false. W844 already pins the
 *   *modal* side of that transition: the `win-banner-backdrop` scrim
 *   unmounts and the `end-panel` loses its `dialog`/`aria-modal` roles.
 *
 *   What W844 does NOT pin is the *content* side of the same transition.
 *   The end-panel render gate is `phase === "ended" && finalScore !== null`
 *   (PlayPage.tsx ~line 2655), which is independent of `showWinBanner` —
 *   so after the Esc dismiss, the user must still be able to see their
 *   final score, time, best, seed and end-actions row. This is the whole
 *   point of dismissing the *banner* without restarting the round: the
 *   user wants the modal overlay out of the way while still inspecting
 *   their stats. A regression that accidentally gated the end-stats
 *   subtree behind `showWinBanner` (e.g. moving the `<dl class="end-stats">`
 *   inside the `{showWinBanner && (...)}` block, or replacing the
 *   `phase === "ended"` gate with a `showWinBanner` gate) would
 *   silently destroy the post-dismiss stats view while W844 stayed green
 *   (W844 only checks the backdrop and the dialog role, not the stats).
 *
 * Strategy:
 *   Mirror W844's win-banner fixture (single-dispatch terminal-win, hoisted
 *   plugin, registry mock, confetti null-stub) so the two tests pin
 *   complementary halves of the same Esc-dismiss transition. After the
 *   banner mounts, dispatch a synthetic Escape keydown on `window` (the
 *   listener target the banner-keydown effect uses), then assert that
 *   the end-stats subtree is still mounted and still shows the score —
 *   i.e. dismissing the banner only removes the modal chrome, never the
 *   stats content. The score's terminal value is sourced from the
 *   fixture's `isTerminal` payload (`{ score: 100 }`), so we can pin the
 *   exact text "100" with no rounding or formatting ambiguity.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W844's win-banner fixture — reducer
// increments `moves`, isTerminal returns a positive-score payload as soon
// as `moves >= 1`, so a single dispatch from the fixture button drives
// PlayPage straight into the terminal-win branch that mounts both the
// win banner (with the Esc-dismiss listener) and the end-panel stats
// subtree we want to assert against.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-esc-end-stats-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Esc End Stats Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for post-Esc end-stats visibility assertion.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 100 } : null,
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
// terminal-win render side-effect-free, mirroring the sibling tests.
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

describe("PlayPage end-panel: stats stay visible after Esc dismisses the win banner (W848)", () => {
  it("keeps the end-stats subtree and final score mounted once the win banner is Esc-dismissed", async () => {
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

    // Drive the round to terminal-win. One click is enough — the fixture's
    // isTerminal flips on the first dispatch with score=100.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the win banner is mounted before the Esc keypress, and the
    // end-stats subtree is showing the fixture's terminal score (100).
    // Pinning the score *before* and *after* the dismiss is what proves
    // the dismiss didn't accidentally unmount the stats content.
    expect(screen.getByTestId("win-banner-backdrop")).toBeTruthy();
    expect(screen.getByTestId("end-stats")).toBeTruthy();
    const finalScoreBefore = screen.getByTestId("final-score");
    expect(finalScoreBefore.textContent).toBe("100");

    // Press Escape on window — that's where PlayPage's banner-keydown
    // effect attaches its listener. This is the same flow W844 covers
    // for the *modal-chrome* side of the transition.
    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    });

    // The contract pin: after the dismiss, the modal backdrop is gone
    // (cross-checked here so a regression that broke the dismiss entirely
    // would be obvious), but the end-stats subtree is *still* mounted
    // and *still* shows the same final score. The end-panel render gate
    // is `phase === "ended" && finalScore !== null`, which `setBannerDismissed`
    // does not touch, so the stats view must survive the dismiss.
    expect(screen.queryByTestId("win-banner-backdrop")).toBeNull();
    expect(screen.getByTestId("end-panel")).toBeTruthy();
    expect(screen.getByTestId("end-stats")).toBeTruthy();
    expect(screen.getByTestId("end-stats-time")).toBeTruthy();
    const finalScoreAfter = screen.getByTestId("final-score");
    expect(finalScoreAfter.textContent).toBe("100");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
