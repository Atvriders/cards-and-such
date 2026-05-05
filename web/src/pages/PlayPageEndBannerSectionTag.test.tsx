/**
 * Unit test for the PlayPage end-panel `<section>` element tagName (W1745).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2654) renders the end-panel as a semantic
 *   `<section>` element (not a `<div>`):
 *     <section
 *       className={`end-panel${isWin ? " end-panel--win" : ""}...`}
 *       data-testid="end-panel"
 *       role={(showWinBanner || showLossBanner) ? "dialog" : undefined}
 *       aria-modal={...}
 *       aria-label={...}
 *     >
 *   The `<section>` tag is the load-bearing landmark element that
 *   carries the `role="dialog"` override during the banner phase. If
 *   the element were silently swapped to a `<div>`, screen readers
 *   would lose the implicit sectioning fallback when the banner is
 *   *not* mounted (phase=ended, no banner) — the round-summary
 *   region would degrade to a generic group with no implicit role.
 *
 *   Sibling tests cover related end-panel attributes:
 *     - W1732 winModifierClass: pins `end-panel--win` modifier.
 *     - W1739 lossModifierClass: pins `end-panel--loss` modifier.
 *     - W1674 winDialogRole: pins `role="dialog"` during banner.
 *     - W1684 winAriaModal: pins `aria-modal="true"` during banner.
 *     - W858 / W863 winBannerAriaLabel / lossBannerAriaLabel: pin
 *       `aria-label="You won"` / `aria-label="Game over"`.
 *     - W811 endPanelDataWin: pins `data-win` boolean attribute.
 *     - W1336 finalScoreParentClass: pins `parentElement.classList`
 *       contains `end-panel` (base BEM block token).
 *   None of them assert the *tagName* of the end-panel itself. A
 *   regression that swapped `<section>` for `<div>` while preserving
 *   the className, role, and aria-* attributes would silently slip
 *   past every existing assertion.
 *
 * Strategy:
 *   Mirror W1732's win-banner fixture (single-dispatch terminal-win,
 *   hoisted plugin, registry mock, confetti null-stub) so this test
 *   pins the same modal-mount transition as its siblings. After the
 *   banner mounts, assert `endPanel.tagName === "SECTION"`. One
 *   attribute, one render — distinct from className / role / aria
 *   tests that own those orthogonal contracts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W1732 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the end-panel <section> —
// the exact element whose tagName we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-end-panel-section-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner end-panel SECTION tagName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-panel <section> tagName assertion.",
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

describe("PlayPage end-panel: rendered as a <section> element (W1745)", () => {
  it("renders the end-panel with tagName === 'SECTION' on a win", async () => {
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

    // Drive the round to terminal-win. One click is enough — the
    // fixture's isTerminal flips on the first dispatch with score=100,
    // which mounts the end-panel <section>.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the win-banner backdrop is mounted (confirms we reached
    // the terminal-win branch that mounts the end-panel).
    expect(screen.getByTestId("win-banner-backdrop")).toBeTruthy();

    // The contract pin: the end-panel element is a <section>, not a
    // <div> or any other tag. tagName is upper-case in the HTML
    // namespace under jsdom (and in browsers). A regression that
    // swapped the element while preserving className / role / aria-*
    // would fail this single assertion without colliding with the
    // neighbouring class / role / aria-modal / aria-label tests.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.tagName).toBe("SECTION");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
