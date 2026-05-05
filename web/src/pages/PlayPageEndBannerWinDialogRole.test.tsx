/**
 * Unit test for the PlayPage win-banner end-panel `role="dialog"` attribute
 * (W1674).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2658) renders the end-panel `<section>` with
 *   `role={(showWinBanner || showLossBanner) ? "dialog" : undefined}`.
 *   While the win banner is on-screen, this turns the end-panel into a
 *   modal dialog (paired with `aria-modal="true"` and the
 *   `aria-label="You won"` accessible name) — without `role="dialog"`,
 *   screen readers would announce the end-panel as a generic landmark
 *   region instead of a modal, breaking the focus-trap contract that
 *   the surrounding banner-dismiss behaviour assumes.
 *
 *   Sibling tests cover related win-banner attributes:
 *     - W858 winBannerAriaLabel: pins `aria-label="You won"` exactly.
 *     - W853 winBackdropDismiss: covers the backdrop click flow.
 *     - W834 winEscDismiss: pins the AFTER state where role is NOT
 *       "dialog" anymore (the negative side of this attribute).
 *   None of them assert the POSITIVE win-side `role="dialog"` value
 *   while the banner is mounted. A regression that swapped the role
 *   to "alertdialog", "region", or dropped it entirely on the win
 *   branch (e.g. `showWinBanner ? undefined : showLossBanner ? "dialog"
 *   ...`) would silently slip past the existing assertions, since they
 *   either check the loss branch or the post-dismiss state.
 *
 * Strategy:
 *   Mirror W858's win-banner fixture (single-dispatch terminal-win,
 *   hoisted plugin, registry mock, confetti null-stub) so this test pins
 *   the same modal-mount transition as its siblings. After the banner
 *   mounts, assert the end-panel's `role` attribute is exactly "dialog".
 *   One attribute, one render, no dismiss flow — enough to catch a
 *   regression without duplicating coverage that other Wxxx tests own.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W858 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the end-panel as a modal
// dialog with `role="dialog"` — the exact attribute we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-dialog-role-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner Dialog Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner role=dialog assertion.",
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

describe("PlayPage win banner: end-panel exposes role=\"dialog\" while the banner is on-screen (W1674)", () => {
  it("renders the end-panel with role=\"dialog\" exactly when showWinBanner is true", async () => {
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
    // showWinBanner=true branch — the same branch that drives the role
    // ternary into its "dialog" arm).
    expect(screen.getByTestId("win-banner-backdrop")).toBeTruthy();

    // The contract pin: the end-panel <section> exposes role="dialog"
    // exactly. Anything else — "alertdialog", "region", undefined, or
    // an empty string — would break the modal contract that screen
    // readers and the focus-trap behaviour both depend on.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("role")).toBe("dialog");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
