/**
 * Unit test for the PlayPage end-panel `end-panel--win` modifier className
 * (W1732).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2655) renders the end-panel `<section>` with a
 *   composed className of the form:
 *     `end-panel${isWin ? " end-panel--win" : ""}${isLoss ? " end-panel--loss" : ""}${(showWinBanner || showLossBanner) ? " end-panel--banner" : ""}`
 *   The `end-panel--win` modifier is the BEM-style hook that the
 *   PlayPage.css stylesheet keys win-only celebratory styling off
 *   (golden border, score colour, etc.) — without that token, the
 *   end-panel falls back to its neutral form even when the player won
 *   the round.
 *
 *   Sibling tests cover related end-panel attributes:
 *     - W1674 winDialogRole: pins `role="dialog"`.
 *     - W1684 winAriaModal: pins `aria-modal="true"`.
 *     - W811  data-win="true": pins the boolean data attribute.
 *     - W1414 / W1336 / W1094 / W1406 / W1425: pin `final-score`
 *       contents and the `final-score--win` modifier on the *score* div.
 *   None of them assert the `end-panel--win` *modifier class* on the
 *   end-panel <section> itself. A regression that flipped the ternary
 *   (e.g. `isWin ? "" : " end-panel--win"`), renamed the token to
 *   `end-panel-win`, or dropped it entirely while the dialog/aria-modal
 *   attributes still resolve, would silently slip past the existing
 *   assertions.
 *
 * Strategy:
 *   Mirror W1674's win-banner fixture (single-dispatch terminal-win,
 *   hoisted plugin, registry mock, confetti null-stub) so this test
 *   pins the same modal-mount transition as its siblings. After the
 *   banner mounts, assert the end-panel's `classList` contains exactly
 *   `end-panel--win`. One attribute, one render — distinct from the
 *   role / aria-modal / data-win tests that own those attributes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W1674 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the end-panel with the
// `end-panel--win` modifier — the exact class we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-end-panel-win-modifier-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner end-panel--win Modifier Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-panel--win modifier className assertion.",
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

describe("PlayPage win banner: end-panel exposes the 'end-panel--win' modifier className (W1732)", () => {
  it("renders the end-panel <section> with the `end-panel--win` modifier class on a win", async () => {
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
    // the end-panel and drives the className ternary into its `isWin`
    // arm, appending the `end-panel--win` modifier token.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the win-banner backdrop is mounted (proves we're in the
    // showWinBanner=true branch — the same branch that drives the
    // `isWin` className ternary into its `end-panel--win` arm).
    expect(screen.getByTestId("win-banner-backdrop")).toBeTruthy();

    // The contract pin: the end-panel <section> carries the
    // `end-panel--win` modifier class. Use classList.contains rather
    // than `className === "..."` so this stays compatible with the
    // sibling `end-panel--banner` token that the dialog-mounted form
    // also appends (W1674 sibling behaviour). A rename, deletion, or
    // ternary flip on this specific BEM token would fail this check
    // without colliding with neighbouring tests.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.classList.contains("end-panel--win")).toBe(true);
    // Negative pin: the loss modifier MUST NOT be present on a win —
    // catches a regression that always appends both modifiers.
    expect(endPanel.classList.contains("end-panel--loss")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
