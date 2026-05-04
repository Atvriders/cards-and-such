/**
 * Unit test for the PlayPage loss-banner Esc-to-dismiss keyboard flow (W879).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1490) installs a window keydown listener while
 *   `showLossBanner` is true. On Escape it calls `setBannerDismissed(true)`,
 *   which flips `showLossBanner` to false. The visible consequence is the
 *   loss-path mirror of W844: the modal-style overlay unmounts: the
 *   `loss-banner-backdrop` element (the click-to-dismiss scrim that gates
 *   the banner's modal feel) leaves the DOM, and the `end-panel` loses its
 *   `dialog`/`aria-modal` roles plus its `end-panel--banner` modifier
 *   class. The end-panel itself stays mounted because `phase === "ended"`
 *   is still true (the user can still see their final loss summary), but
 *   it's no longer rendered as a dismissable modal — i.e. the banner is
 *   dismissed without restarting the round.
 *
 *   W844 pins the Esc-dismiss flow on the win path. W875 pins the loss
 *   backdrop click-to-dismiss flow. Nothing currently pins the Esc-dismiss
 *   flow on the loss path: a regression that gated the loss-banner keydown
 *   effect behind `showWinBanner` only, swapped `setBannerDismissed(true)`
 *   for `setBannerDismissed(false)` on the loss arm, or removed the loss
 *   keydown effect entirely would silently break Esc-to-dismiss UX for
 *   every losing round while every existing loss test stayed green.
 *
 * Strategy:
 *   Mirror W875's loss fixture (single-dispatch zero-score terminal,
 *   hoisted plugin, registry mock, confetti null-stub) so PlayPage walks
 *   the loss branch (`isLoss === true`, `showLossBanner === true`). After
 *   the loss banner mounts, confirm `loss-banner-backdrop` is present,
 *   then dispatch a synthetic Escape keydown on `window` (where PlayPage's
 *   loss-banner keydown effect attaches its listener). The contract pin:
 *   `loss-banner-backdrop` must unmount, while the `end-panel` stays
 *   mounted with its dialog/aria-modal roles + `end-panel--banner`
 *   modifier stripped (Esc dismisses the banner, it does not restart the
 *   round — that's Enter's job).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W875 — reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action, the canonical losing-terminal
// shape that drives PlayPage straight into the showLossBanner=true branch
// where the backdrop scrim mounts and the loss-banner keydown effect
// attaches its Esc listener.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-esc-dismiss-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Esc Dismiss Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner Esc-dismiss assertion.",
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

describe("PlayPage loss banner: Esc dismisses the banner (W879)", () => {
  it("unmounts the loss-banner backdrop and strips dialog/aria-modal from end-panel when Escape is pressed while the banner is on-screen", async () => {
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
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: the loss banner is mounted before the Esc keypress, and
    // the end-panel is on the loss branch with full modal gating in
    // place. Both the modal scrim and the end-panel live inside the
    // terminal-loss render branch with `showLossBanner === true`, so
    // both should be in the DOM right now with the modal roles applied.
    expect(screen.getByTestId("loss-banner-backdrop")).toBeTruthy();
    const endPanelBefore = screen.getByTestId("end-panel");
    expect(endPanelBefore.getAttribute("data-win")).toBe("false");
    expect(endPanelBefore.getAttribute("role")).toBe("dialog");
    expect(endPanelBefore.getAttribute("aria-modal")).toBe("true");

    // Press Escape on window — that's where PlayPage's loss-banner
    // keydown effect attaches its listener (mirror of the win-banner
    // effect at ~line 1471 covered by W844).
    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    });

    // The contract pin: setBannerDismissed(true) flips showLossBanner to
    // false, which unmounts the backdrop scrim and strips the
    // dialog/aria-modal roles + `end-panel--banner` modifier from the
    // end-panel. The end-panel itself stays mounted (phase is still
    // "ended", so the user can still see their final loss summary),
    // proving Esc dismissed the *banner* without also restarting the
    // round (that's Enter's job — and on the loss path Enter replays
    // the *same* seed, so a regression conflating the two would be
    // particularly destructive).
    expect(screen.queryByTestId("loss-banner-backdrop")).toBeNull();
    const endPanelAfter = screen.getByTestId("end-panel");
    expect(endPanelAfter.getAttribute("role")).not.toBe("dialog");
    expect(endPanelAfter.getAttribute("aria-modal")).not.toBe("true");
    expect(endPanelAfter.className).not.toMatch(/end-panel--banner/);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
