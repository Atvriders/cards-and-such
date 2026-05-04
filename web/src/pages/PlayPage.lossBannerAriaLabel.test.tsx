/**
 * Unit test for the PlayPage loss-banner end-panel `aria-label="Game over"`
 * accessible name (W863).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2660) renders the end-panel `<section>` with
 *   `aria-label={showWinBanner ? "You won" : showLossBanner ? "Game over"
 *   : undefined}`. While the loss banner is up, the end-panel also carries
 *   `role="dialog"` + `aria-modal="true"` (paired with the same dialog
 *   semantics W844 pins for the win path), and the `aria-label` is what
 *   gives that dialog its accessible name — without it, screen-reader
 *   users would land in an unnamed modal.
 *
 *   Sibling W858 (PlayPage.winBannerAriaLabel.test.tsx) pins the win arm
 *   ("You won") of the same ternary. The loss arm ("Game over") is the
 *   second branch of that ternary and currently has nothing pinning its
 *   exact string. A regression that swapped `"Game over"` for an empty
 *   string, dropped the prop entirely, or accidentally inverted the
 *   win/loss ternary would silently rob the loss-modal of its accessible
 *   name without any neighbouring assertion noticing.
 *
 * Strategy:
 *   Mirror W845's hoisted-fixture pattern (single-dispatch terminal-loss
 *   reducer, hoisted plugin, registry mock, confetti null-stub) so this
 *   test pins the same modal-mount transition as its loss-path siblings.
 *   After the banner mounts, assert the end-panel exposes
 *   `aria-label="Game over"` — the exact string the source ternary writes
 *   for the loss branch. This one attribute is the dialog's accessible
 *   name; pinning it on a single render is enough to catch a regression
 *   without duplicating the dismiss/click flows that other Wxxx tests
 *   already cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W845 — reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action, the canonical losing-terminal
// shape that drives PlayPage straight into the showLossBanner=true branch
// that mounts the end-panel as a modal dialog with the
// `aria-label="Game over"` accessible name we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-aria-label-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Aria Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner aria-label assertion.",
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
// confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss banner: end-panel exposes aria-label=\"Game over\" as the dialog accessible name (W863)", () => {
  it("renders the end-panel with aria-label=\"Game over\" while the loss banner is on-screen", async () => {
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

    // Drive the round into terminal-loss (score === 0). One click is enough
    // — the fixture's isTerminal flips to `{ score: 0 }` on the first
    // dispatched LOSE, which mounts the loss banner and flips the
    // end-panel into its modal-dialog form.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: the end-panel mounts with data-win="false" — confirms we're
    // in the showLossBanner=true branch (the same branch that drives the
    // aria-label ternary into its "Game over" arm). Without this guard,
    // the aria-label assertion below could pass for the wrong reason.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // The contract pin: the end-panel <section> exposes the exact
    // accessible name the source writes for the loss branch. This is the
    // dialog's name (paired with role="dialog"/aria-modal="true") —
    // without it, screen-reader users would land in an unnamed modal,
    // so the exact string matters.
    expect(endPanel.getAttribute("aria-label")).toBe("Game over");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
