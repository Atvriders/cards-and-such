/**
 * Unit test for PlayPage loss-banner backdrop element (W868).
 *
 * Observable behavior:
 *   When the game reaches a *losing* terminal (`isTerminal` returns
 *   `{ score: 0 }`) and the banner is still on-screen
 *   (`!bannerDismissed`), PlayPage.tsx (~line 2644) mounts a separate
 *   sibling `<div>` *outside* the end-panel:
 *
 *     {showLossBanner && (
 *       <div
 *         className="win-banner-backdrop loss-banner-backdrop"
 *         data-testid="loss-banner-backdrop"
 *         onClick={() => setBannerDismissed(true)}
 *         role="presentation"
 *       />
 *     )}
 *
 *   This is the visual scrim that dims the rest of the page while the
 *   loss-modal is up — the exact mirror of the `win-banner-backdrop`
 *   that W857 (PlayPage.winBackdropDismiss.test.tsx) pins for the win
 *   path. The element is what makes the loss end-panel feel like a
 *   modal (paired with `role="dialog"` + `aria-modal="true"` on the
 *   panel itself) and what gives the user a click-anywhere-to-dismiss
 *   target.
 *
 *   Existing loss-path coverage pins the headline + encouragement
 *   (W845), end-seed (W850), back-to-lobby link (W856), new-game button
 *   (W861), aria-label (W863), and Save Replay visibility (W866) — all
 *   *inside* the end-panel. None of them assert that the sibling
 *   backdrop scrim is mounted on the loss path. A regression that
 *   wrapped the backdrop in `{showWinBanner && ...}` (matching the
 *   adjacent win-only block) — or that dropped the loss arm during a
 *   refactor — would silently strip the scrim from every losing round
 *   while every existing loss test stayed green: the end-panel itself
 *   would still mount, just without the dim overlay or its
 *   click-to-dismiss target.
 *
 * Strategy:
 *   Mirror W845's hoisted-fixture pattern (reducer flips to
 *   `isTerminal: { score: 0 }` on a single dispatched LOSE action) so
 *   PlayPage walks the loss branch (`isWin === false`,
 *   `showLossBanner === true`). After the loss banner mounts, assert:
 *     1. The end-panel mounts with `data-win="false"` — confirms we
 *        really are on the loss branch, otherwise the backdrop pin
 *        below could pass for the wrong reason (the win-backdrop is
 *        already pinned by W857).
 *     2. `loss-banner-backdrop` is mounted — the contract pin.
 *     3. The backdrop carries the exact `loss-banner-backdrop` class
 *        (alongside the shared `win-banner-backdrop` base class) — a
 *        regression that swapped the loss-specific class for something
 *        else would still leave the scrim DOM but break the styling
 *        hook that gives the loss path its distinct look.
 *     4. The backdrop carries `role="presentation"` — load-bearing
 *        a11y semantic that keeps screen-readers from announcing the
 *        scrim as an interactive element (the dialog-modal semantic
 *        lives on the end-panel, not the scrim).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W845/W850/W863 — reducer flips to a
// `{ score: 0 }` terminal on a single dispatched LOSE action, the canonical
// losing-terminal shape that drives PlayPage straight into the
// showLossBanner=true branch where the backdrop scrim mounts.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-backdrop-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Backdrop Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner backdrop assertion.",
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

describe("PlayPage loss-banner backdrop scrim (W868)", () => {
  it("mounts the loss-banner-backdrop sibling with the correct class + role on a zero-score terminal", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: backdrop is NOT mounted before the game ends — it
    // lives behind `showLossBanner`, which is false during setup/playing.
    expect(screen.queryByTestId("loss-banner-backdrop")).toBeNull();

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0). One click is
    // enough — the fixture's isTerminal flips to `{ score: 0 }` on the
    // first dispatched LOSE, which mounts the loss banner and the
    // backdrop scrim sibling.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // (1) End-panel mounted with data-win="false" — confirms the loss
    // branch is the one driving render. Without this guard, the backdrop
    // assertions below could pass for the wrong reason (W857 already
    // pins the win-banner-backdrop on the win path).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // (2) Contract pin: the loss-banner-backdrop sibling mounts. This is
    // the scrim that dims the rest of the page; without it, the loss
    // end-panel still renders but loses its modal feel and the
    // click-anywhere-to-dismiss target.
    const backdrop = screen.getByTestId("loss-banner-backdrop");
    expect(backdrop).toBeTruthy();

    // (3) Class pin: carries both the shared `win-banner-backdrop` base
    // class (for the shared scrim styling) AND the loss-specific
    // `loss-banner-backdrop` modifier (for any loss-only overrides).
    // A regression that dropped the loss-specific modifier would still
    // mount the scrim DOM but break the styling hook.
    expect(backdrop.classList.contains("win-banner-backdrop")).toBe(true);
    expect(backdrop.classList.contains("loss-banner-backdrop")).toBe(true);

    // (4) A11y pin: `role="presentation"` keeps screen-readers from
    // announcing the scrim itself as an interactive element. The
    // dialog/modal semantics live on the end-panel (W863), not on
    // the scrim. A regression that swapped `role="presentation"` for
    // `role="button"` or dropped the role entirely would let
    // screen-readers stumble over the scrim before reaching the
    // labelled dialog.
    expect(backdrop.getAttribute("role")).toBe("presentation");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
