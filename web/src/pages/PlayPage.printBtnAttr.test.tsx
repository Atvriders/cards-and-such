/**
 * Unit test for the PlayPage end-banner Print button's `aria-label` (W1225).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2782) renders the Print button with
 *   `aria-label="Print scoresheet"`. The visible label is just "Print"
 *   (PlayPage.tsx line 2785), which is ambiguous out-of-context for
 *   screen-reader users — the aria-label is the only thing that
 *   disambiguates "print this scoresheet" from generic browser print.
 *
 *   W778 (PlayPage.share.test.tsx) and W882 (PlayPage.lossBannerPrint
 *   .test.tsx) both pin the *click* behavior of `play-print-btn` (one
 *   on the win path, one on the loss path), and W1138
 *   (endShareRowStructural) pins the wrapper class. None of them
 *   pin the button's accessibility contract — a refactor that
 *   dropped the `aria-label`, renamed it to "Print" (collapsing the
 *   accessible name onto the visible text), or replaced it with a
 *   different phrasing would silently regress the screen-reader
 *   experience while every existing test continued to pass.
 *
 * Strategy:
 *   Drive PlayPage to the terminal-win banner using the same hoisted
 *   minimal-fixture pattern as W778/W1138, locate `play-print-btn`
 *   by testid, and assert exactly `aria-label="Print scoresheet"`.
 *   No window.print stub needed — this test never clicks the button.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "print-btn-attr-fixture";
  type State = { won: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Print Btn Attr Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for play-print-btn aria-label test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: 100 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-win"
          onClick={() => dispatch({ type: "WIN" })}
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

describe("PlayPage play-print-btn aria-label (W1225)", () => {
  it('renders aria-label="Print scoresheet" on the end-banner Print button', async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));

    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-win"));
    });

    const printBtn = screen.getByTestId("play-print-btn");
    expect(printBtn.getAttribute("aria-label")).toBe("Print scoresheet");
  });
});

void React;
