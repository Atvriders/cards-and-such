/**
 * Unit test for the PlayPage loss-banner backdrop click-to-dismiss flow (W875).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2647) renders a `loss-banner-backdrop` scrim with an
 *   `onClick={() => setBannerDismissed(true)}` handler while
 *   `showLossBanner` is true. Clicking the scrim flips `showLossBanner` to
 *   false, which unmounts the backdrop sibling itself — the loss-path
 *   pointer mirror of W853 (PlayPage.winBackdropDismiss.test.tsx). The
 *   end-panel stays mounted because `phase === "ended"` is still true, so
 *   the user keeps seeing their final loss summary; only the modal banner
 *   gating goes away.
 *
 *   W868 pins that the `loss-banner-backdrop` *mounts* with the right
 *   class + role on a zero-score terminal. W853 pins the *click-to-dismiss*
 *   behavior on the win path. Nothing currently pins the click-to-dismiss
 *   behavior on the loss path: a regression that swapped the loss-path
 *   onClick handler for `setBannerDismissed(false)`, dropped the onClick
 *   wiring on the loss arm, or hoisted the click to a no-op overlay would
 *   silently break click-anywhere-outside-the-banner UX for every losing
 *   round while every existing loss test stayed green.
 *
 * Strategy:
 *   Mirror W868's loss fixture (single-dispatch zero-score terminal,
 *   hoisted plugin, registry mock, confetti null-stub) so PlayPage walks
 *   the loss branch (`isWin === false`, `showLossBanner === true`). After
 *   the loss banner mounts, confirm `loss-banner-backdrop` is present,
 *   then `fireEvent.click` it. The contract pin: `loss-banner-backdrop`
 *   unmounts (banner gate flipped off) while `end-panel` is still mounted
 *   (round did not restart — restart is Enter's job).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W868 — reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action, the canonical losing-terminal
// shape that drives PlayPage straight into the showLossBanner=true branch
// where the backdrop scrim mounts with its click-to-dismiss handler.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-backdrop-click-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Backdrop Click Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner backdrop-click-dismiss assertion.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ lost: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "LOSE" ? { lost: true } : s,
    isTerminal: (s: State) => (s.lost ? { score: 0 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-lose"
          onClick={() => dispatch({ type: "LOSE" })}
        >
          lose
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
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti — see W825 — but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss banner: clicking the backdrop dismisses the banner (W875)", () => {
  it("unmounts the loss-banner backdrop while leaving end-panel mounted when the scrim is clicked", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0). One click is
    // enough — the fixture's isTerminal flips to `{ score: 0 }` on the
    // first dispatched LOSE, which mounts the loss banner and the
    // backdrop scrim sibling.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: the loss banner is mounted before the backdrop click, and
    // the end-panel is on the loss branch. Both the modal scrim and the
    // end-panel live inside the terminal-loss render branch, so both
    // should be in the DOM right now.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");
    const backdrop = screen.getByTestId("loss-banner-backdrop");
    expect(backdrop).toBeTruthy();

    // Click the backdrop — that's where PlayPage attaches the
    // setBannerDismissed(true) onClick handler on the loss arm. This is
    // the loss-path pointer counterpart to W853's win-path backdrop click.
    act(() => {
      fireEvent.click(backdrop);
    });

    // The contract pin: setBannerDismissed(true) flips showLossBanner to
    // false, which unmounts the backdrop scrim itself. The end-panel
    // stays mounted because phase is still "ended" — clicking the
    // backdrop dismisses the *banner*, not the round.
    expect(screen.queryByTestId("loss-banner-backdrop")).toBeNull();
    expect(screen.getByTestId("end-panel")).toBeTruthy();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
