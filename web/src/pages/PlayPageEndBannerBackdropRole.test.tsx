/**
 * Unit test for the PlayPage win-banner backdrop `role="presentation"`
 * attribute (W1410).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2636-2641) renders the win-banner backdrop scrim
 *   as a `<div className="win-banner-backdrop" data-testid="win-banner-
 *   backdrop" onClick={...} role="presentation" />`. The `role="presentation"`
 *   attribute is load-bearing: it removes the bare scrim `<div>` from the
 *   accessibility tree so screen-readers don't announce an unlabeled
 *   region between the page background and the actual `role="dialog"`
 *   end-panel. Without it, AT users would hear a phantom container with
 *   no name or purpose every time the win banner mounts.
 *
 *   Sibling tests already cover the WIN backdrop's mount/unmount + click-
 *   to-dismiss behaviour (W853 winBackdropDismiss, W844 winBannerAria-
 *   Label, W848 winEscEndStats), and the LOSS backdrop's `role="presen-
 *   tation"` is pinned by lossBannerBackdrop. Nothing currently asserts
 *   the same `role="presentation"` on the **win** backdrop — a regression
 *   that swapped it for `role="button"`, dropped the prop entirely, or
 *   only kept it on the loss branch would silently re-introduce the
 *   phantom region for win-path users without any sibling assertion
 *   noticing.
 *
 * Strategy:
 *   Mirror W858's win-banner fixture (single-dispatch terminal-win,
 *   hoisted plugin, registry mock, Confetti null-stub) so this test pins
 *   the same modal-mount transition as its siblings. After the banner
 *   mounts, locate the `win-banner-backdrop` testid and assert its
 *   `role` attribute is exactly `"presentation"`. One attribute on one
 *   render — enough to catch the regression without duplicating the
 *   dismiss/click flows other tests already pin.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as W858/W844: reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch drives PlayPage straight into the terminal-win
// branch that mounts the win-banner-backdrop scrim with role="presentation".
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-backdrop-role-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Backdrop Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner-backdrop role assertion.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 42 } : null,
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

describe('PlayPage win-banner-backdrop carries role="presentation" (W1410)', () => {
  it('exposes role="presentation" on the win-banner-backdrop scrim while the win banner is on-screen', async () => {
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

    // Drive the round to terminal-win. One click flips isTerminal and
    // mounts the win banner + its backdrop scrim.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // The contract pin: the backdrop carries role="presentation" so AT
    // users don't land on a phantom container before the dialog. Exact
    // string match — a regression that dropped the attribute or swapped
    // it for any other role (e.g. "button", "dialog", "none") would flip
    // this assertion red.
    const backdrop = screen.getByTestId("win-banner-backdrop");
    expect(backdrop.getAttribute("role")).toBe("presentation");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
