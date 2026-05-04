/**
 * Unit test for the PlayPage end-panel after the loss-banner is Esc-dismissed (W884).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1490) installs a window keydown listener while
 *   `showLossBanner` is true. On Escape it calls `setBannerDismissed(true)`,
 *   which flips `showLossBanner` from true to false. W879 already pins the
 *   *modal* side of that transition: the `loss-banner-backdrop` scrim
 *   unmounts and the `end-panel` loses its `dialog`/`aria-modal` roles plus
 *   its `end-panel--banner` modifier class.
 *
 *   What W879 does NOT pin is the *content* side of the same transition.
 *   The end-panel render gate is `phase === "ended" && finalScore !== null`
 *   (PlayPage.tsx ~line 2653), which is independent of `showLossBanner` —
 *   so after the Esc dismiss, the user must still be able to see their
 *   final score, time, seed, end-actions row and the loss-banner title
 *   ("Game over"). This is the whole point of dismissing the *banner*
 *   without restarting the round: the user wants the modal overlay out
 *   of the way while still inspecting their final stats and headline.
 *   A regression that accidentally gated the end-stats subtree or the
 *   loss-banner headline behind `showLossBanner` (e.g. moving the
 *   `<dl class="end-stats">` or the `loss-banner-title <h2>` inside a
 *   `{showLossBanner && (...)}` block, or replacing the `phase === "ended"`
 *   gate with a `showLossBanner` gate) would silently destroy the
 *   post-dismiss stats + headline view while W879 stayed green (W879
 *   only checks the backdrop and the dialog role, not the stats or the
 *   headline copy). W848 is the win-path mirror of this test.
 *
 * Strategy:
 *   Mirror W879's loss fixture (single-dispatch zero-score terminal,
 *   hoisted plugin, registry mock, confetti null-stub) so PlayPage walks
 *   the loss branch (`isLoss === true`, `showLossBanner === true`). After
 *   the loss banner mounts, dispatch a synthetic Escape keydown on
 *   `window` (the listener target the loss-banner keydown effect uses),
 *   then assert that the end-panel is still mounted and the
 *   `end-stats-time` row plus the "Game over" loss-banner title are still
 *   visible — i.e. dismissing the banner only removes the modal chrome,
 *   never the stats content or the loss headline.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W879's loss-banner fixture — reducer
// flips to a `{ score: 0 }` terminal on a single dispatched LOSE action,
// the canonical losing-terminal shape that drives PlayPage straight into
// the showLossBanner=true branch where the loss-banner headline mounts
// alongside the end-stats subtree we want to assert against.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-esc-end-stats-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Esc End Stats Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for post-Esc loss end-stats visibility assertion.",
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

describe("PlayPage end-panel: stats stay visible after Esc dismisses the loss banner (W884)", () => {
  it("keeps the end-panel + end-stats-time + loss-banner-title (\"Game over\") mounted once the loss banner is Esc-dismissed", async () => {
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

    // Sanity: the loss banner is mounted before the Esc keypress, with
    // the modal scrim in place and the "Game over" headline + end-stats
    // subtree visible. Pinning the headline + stats *before* and *after*
    // the dismiss is what proves the dismiss didn't accidentally unmount
    // the content along with the modal chrome.
    expect(screen.getByTestId("loss-banner-backdrop")).toBeTruthy();
    expect(screen.getByTestId("end-panel")).toBeTruthy();
    expect(screen.getByTestId("end-stats-time")).toBeTruthy();
    const titleBefore = screen.getByText("Game over");
    expect(titleBefore.className).toMatch(/loss-banner-title/);

    // Press Escape on window — that's where PlayPage's loss-banner
    // keydown effect attaches its listener. This is the same flow W879
    // covers for the *modal-chrome* side of the transition.
    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    });

    // The contract pin: after the dismiss, the modal backdrop is gone
    // (cross-checked here so a regression that broke the dismiss entirely
    // would be obvious), but the end-panel is *still* mounted, the
    // `end-stats-time` row is *still* showing, and the "Game over"
    // loss-banner title is *still* visible. The end-panel render gate is
    // `phase === "ended" && finalScore !== null`, which `setBannerDismissed`
    // does not touch, so the stats + headline must survive the dismiss.
    expect(screen.queryByTestId("loss-banner-backdrop")).toBeNull();
    expect(screen.getByTestId("end-panel")).toBeTruthy();
    expect(screen.getByTestId("end-stats-time")).toBeTruthy();
    const titleAfter = screen.getByText("Game over");
    expect(titleAfter.className).toMatch(/loss-banner-title/);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
