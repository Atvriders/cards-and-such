/**
 * Unit test for the PlayPage win-banner Esc-to-dismiss keyboard flow (W844).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1471) installs a window keydown listener while
 *   `showWinBanner` is true. On Escape it calls `setBannerDismissed(true)`,
 *   which flips `showWinBanner` to false. The visible consequence is that
 *   the modal-style overlay unmounts: the `win-banner-backdrop` element
 *   (the click-to-dismiss scrim that gates the banner's modal feel)
 *   leaves the DOM, and the `end-panel` loses its `dialog`/`aria-modal`
 *   roles plus its `end-panel--banner` modifier class. The end-panel
 *   itself stays mounted because `phase === "ended"` is still true (the
 *   user can still see their final score), but it's no longer rendered
 *   as a dismissable modal — i.e. the banner is dismissed without
 *   restarting the round.
 *
 *   W840 pins the hint copy ("Press Enter ... Esc to dismiss") and W834
 *   pins the Enter-restart side. Nothing currently pins the Esc side: a
 *   regression that swapped `setBannerDismissed(true)` for
 *   `setBannerDismissed(false)`, gated the listener behind a stale
 *   condition, or removed the keydown effect entirely would make the hint
 *   copy lie to the user without any neighbouring assertion noticing.
 *
 * Strategy:
 *   Mirror W834's win-banner fixture (single-dispatch terminal-win, hoisted
 *   plugin, registry mock, confetti null-stub). After the banner mounts,
 *   confirm `win-banner-backdrop` is present, then dispatch a synthetic
 *   Escape keydown on `window`. The contract pin: `win-banner-backdrop`
 *   and the `win-banner` headline must unmount, while the `end-panel`
 *   itself is still mounted (Esc dismisses, it does not restart the round
 *   — restart is Enter's job, covered by W834).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W834 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the win banner with the
// Esc-to-dismiss keyboard listener.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-esc-dismiss-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Esc Dismiss Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner Esc-dismiss assertion.",
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

describe("PlayPage win banner: Esc dismisses the banner (W844)", () => {
  it("unmounts the win-banner backdrop and headline when Escape is pressed while the banner is on-screen", async () => {
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

    // Sanity: the win banner is mounted before the Esc keypress. Both the
    // modal backdrop and the "You won!" headline live inside the banner
    // gate (`showWinBanner`), so both should be in the DOM right now.
    expect(screen.getByTestId("win-banner-backdrop")).toBeTruthy();
    expect(screen.getByTestId("win-banner")).toBeTruthy();
    expect(screen.getByTestId("end-panel")).toBeTruthy();

    // Press Escape on window — that's where PlayPage's banner-keydown
    // effect attaches its listener. This is the keyboard flow the
    // win-banner-hint copy promises ("Esc to dismiss").
    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    });

    // The contract pin: setBannerDismissed(true) flips showWinBanner to
    // false, which unmounts the backdrop scrim and strips the
    // dialog/aria-modal roles + `end-panel--banner` modifier from the
    // end-panel. The end-panel itself stays mounted (phase is still
    // "ended", so the user can still see their final score), proving
    // Esc dismissed the *banner* without also restarting the round
    // (that's Enter's job, pinned by W834).
    expect(screen.queryByTestId("win-banner-backdrop")).toBeNull();
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("role")).not.toBe("dialog");
    expect(endPanel.getAttribute("aria-modal")).not.toBe("true");
    expect(endPanel.className).not.toMatch(/end-panel--banner/);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
