/**
 * Unit test for the PlayPage win-banner end-panel `aria-label="You won"`
 * accessible name (W858).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2660) renders the end-panel `<section>` with
 *   `aria-label={showWinBanner ? "You won" : showLossBanner ? "Game over"
 *   : undefined}`. While the win banner is up, the end-panel also carries
 *   `role="dialog"` + `aria-modal="true"` (pinned by W844), and the
 *   `aria-label` is what gives that dialog its accessible name —
 *   without it, screen-reader users would land in an unnamed modal.
 *
 *   W844 covers the dialog/aria-modal pair, W853 covers the backdrop
 *   click, W848 covers post-dismiss stats persistence. Nothing currently
 *   pins the dialog's accessible name itself: a regression that swapped
 *   `"You won"` for an empty string, dropped the prop entirely, or
 *   accidentally inverted the win/loss ternary would silently rob the
 *   modal of its name without any neighbouring assertion noticing.
 *
 * Strategy:
 *   Mirror W844's win-banner fixture (single-dispatch terminal-win,
 *   hoisted plugin, registry mock, confetti null-stub) so this test pins
 *   the same modal-mount transition as its siblings. After the banner
 *   mounts, assert the end-panel exposes `aria-label="You won"` — the
 *   exact string the source ternary writes for the win branch. This
 *   one attribute is the dialog's accessible name; pinning it on a
 *   single render is enough to catch a regression without duplicating
 *   the dismiss/click flows that other Wxxx tests already cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W844 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the end-panel as a modal
// dialog with the `aria-label="You won"` accessible name we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-aria-label-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner Aria Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner aria-label assertion.",
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

describe("PlayPage win banner: end-panel exposes aria-label=\"You won\" as the dialog accessible name (W858)", () => {
  it("renders the end-panel with aria-label=\"You won\" while the win banner is on-screen", async () => {
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
    // isTerminal flips on the first dispatch with score=100, which mounts
    // the win banner and flips the end-panel into its modal-dialog form.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the win-banner backdrop is mounted (proves we're in the
    // showWinBanner=true branch — the same branch that drives the
    // aria-label ternary into its "You won" arm).
    expect(screen.getByTestId("win-banner-backdrop")).toBeTruthy();

    // The contract pin: the end-panel <section> exposes the exact
    // accessible name the source writes for the win branch. This is the
    // dialog's name (paired with role="dialog"/aria-modal="true" pinned
    // by W844) — without it, screen-reader users would land in an
    // unnamed modal, so the exact string matters.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("aria-label")).toBe("You won");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
