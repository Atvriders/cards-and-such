/**
 * Unit test for the PlayPage end-panel `end-panel--banner` modifier className
 * (W2395).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2655) renders the end-panel `<section>` with a
 *   composed className of the form:
 *     `end-panel${isWin ? " end-panel--win" : ""}${isLoss ? " end-panel--loss" : ""}${(showWinBanner || showLossBanner) ? " end-panel--banner" : ""}`
 *   The `end-panel--banner` modifier is the BEM-style hook that the
 *   PlayPage.css stylesheet keys the dialog-modal layout off
 *   (centered viewport overlay, banner-z-index stacking, backdrop-coupled
 *   spacing, etc.) — without that token, the end-panel falls back to
 *   its inline post-game position even though the win/loss backdrop is
 *   on-screen, breaking the modal layout contract.
 *
 *   Sibling tests cover related end-panel attributes:
 *     - W1674 winDialogRole: pins `role="dialog"` on the win banner.
 *     - W1684 winAriaModal: pins `aria-modal="true"` on the win banner.
 *     - W811  data-win="true": pins the boolean data attribute.
 *     - W1732 winModifierClass: pins `end-panel--win` BEM token.
 *     - W1739 lossModifierClass: pins `end-panel--loss` BEM token.
 *     - W1745 sectionTag: pins `tagName === "SECTION"`.
 *   Several sibling tests reference `end-panel--banner` only as a
 *   NEGATIVE assertion AFTER the banner has been dismissed (e.g.
 *   `winEscDismiss`, `lossBannerEscDismiss`) — none of them assert the
 *   POSITIVE presence of this modifier WHILE the banner is mounted. A
 *   regression that flipped the ternary
 *   (e.g. `(showWinBanner || showLossBanner) ? "" : " end-panel--banner"`),
 *   renamed the token to `end-panel-banner`, or dropped it entirely
 *   while the dialog/aria-modal attributes still resolve, would
 *   silently slip past the existing assertions.
 *
 * Strategy:
 *   Mirror W1732's win-banner fixture (single-dispatch terminal-win,
 *   hoisted plugin, registry mock, confetti null-stub) so this test
 *   pins the same modal-mount transition as its siblings. After the
 *   banner mounts, assert the end-panel's `classList` contains
 *   `end-panel--banner`. One attribute, one render — distinct from the
 *   role / aria-modal / data-win / end-panel--win tests that own those
 *   attributes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W1732 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the end-panel with both the
// `end-panel--win` AND `end-panel--banner` modifiers — the latter is
// the class we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-end-panel-banner-modifier-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner end-panel--banner Modifier Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-panel--banner modifier className assertion.",
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

describe("PlayPage end banner: end-panel exposes the 'end-panel--banner' modifier className while the banner is mounted (W2395)", () => {
  it("renders the end-panel <section> with the `end-panel--banner` modifier class while the win banner is on-screen", async () => {
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
    // the end-panel and drives the className ternary into its
    // `(showWinBanner || showLossBanner)` arm, appending the
    // `end-panel--banner` modifier token.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the win-banner backdrop is mounted (proves we're in the
    // showWinBanner=true branch — the same branch that drives the
    // banner-modifier ternary into its `end-panel--banner` arm).
    expect(screen.getByTestId("win-banner-backdrop")).toBeTruthy();

    // The contract pin: the end-panel <section> carries the
    // `end-panel--banner` modifier class while the banner is mounted.
    // Use classList.contains rather than `className === "..."` so this
    // stays compatible with sibling modifier tokens (`end-panel--win`)
    // that the same render also appends. A rename, deletion, or
    // ternary flip on this specific BEM token would fail this check
    // without colliding with neighbouring tests.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.classList.contains("end-panel--banner")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
