/**
 * Unit test for the PlayPage win-banner backdrop click-to-dismiss flow (W853).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2637) renders a `win-banner-backdrop` scrim with an
 *   `onClick={() => setBannerDismissed(true)}` handler while
 *   `showWinBanner` is true. Clicking the scrim flips `showWinBanner` to
 *   false, which unmounts the backdrop itself and strips the
 *   `dialog`/`aria-modal` roles plus the `end-panel--banner` modifier from
 *   the end-panel — the same observable outcome as the Escape key path
 *   pinned by W844. The end-panel itself stays mounted because
 *   `phase === "ended"` is still true, so the user keeps seeing their
 *   final score; only the modal banner gating goes away.
 *
 *   W844 pins the keyboard (Esc) dismiss path. Nothing currently pins the
 *   pointer (backdrop click) dismiss path: a regression that swapped the
 *   handler for `setBannerDismissed(false)`, removed the onClick wiring,
 *   or hoisted the click to a no-op overlay would silently break the
 *   click-anywhere-outside-the-banner UX without any neighbouring
 *   assertion noticing — the modal feel from `aria-modal` and the focus
 *   trap would still test green.
 *
 * Strategy:
 *   Mirror W844's win-banner fixture (single-dispatch terminal-win, hoisted
 *   plugin, registry mock, confetti null-stub). After the banner mounts,
 *   confirm `win-banner-backdrop` is present, then `fireEvent.click` it.
 *   The contract pin: `win-banner-backdrop` unmounts (banner gate flipped
 *   off) while `end-panel` is still mounted (round did not restart —
 *   restart is Enter's job, covered by W834).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W844 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the win banner with its
// click-to-dismiss backdrop scrim.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-backdrop-dismiss-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Backdrop Dismiss Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner backdrop-click-dismiss assertion.",
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

describe("PlayPage win banner: clicking the backdrop dismisses the banner (W853)", () => {
  it("unmounts the win-banner backdrop while leaving end-panel mounted when the scrim is clicked", async () => {
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
    // isTerminal flips on the first dispatch.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the win banner is mounted before the backdrop click. Both
    // the modal scrim and the end-panel live inside the terminal-win
    // render branch, so both should be in the DOM right now.
    const backdrop = screen.getByTestId("win-banner-backdrop");
    expect(backdrop).toBeTruthy();
    expect(screen.getByTestId("end-panel")).toBeTruthy();

    // Click the backdrop — that's where PlayPage attaches the
    // setBannerDismissed(true) onClick handler. This is the pointer
    // counterpart to W844's Escape keypress.
    await act(async () => {
      fireEvent.click(backdrop);
    });

    // The contract pin: setBannerDismissed(true) flips showWinBanner to
    // false, which unmounts the backdrop scrim itself. The end-panel
    // stays mounted because phase is still "ended" — clicking the
    // backdrop dismisses the *banner*, not the round (restart is
    // Enter's job, pinned by W834).
    expect(screen.queryByTestId("win-banner-backdrop")).toBeNull();
    expect(screen.getByTestId("end-panel")).toBeTruthy();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
