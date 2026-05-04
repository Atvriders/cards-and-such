/**
 * W1017 — PlayPage seed-pick popover stepper decrements the draft seed.
 *
 * Companion to W1004 (increment button). W1004 pins the ▲ stepper's
 * "edit-then-apply" contract; this test pins the symmetric ▼ contract so
 * a regression that wired only one of the two arrows correctly cannot slip
 * through.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1901) renders the ▼ button with
 *   `data-testid="play-seed-step-down"` and `aria-label="Decrement seed"`,
 *   wired to `onClick={() => stepSeed(-1)}`. With a draft of "42" the
 *   click must:
 *     1. Drop the input's displayed value to "41"
 *     2. Leave the active game seed unchanged (Apply hasn't been clicked)
 *     3. Leave the popover open so the user can keep adjusting
 *
 * Strategy mirrors PlayPage.seedPickStep.test.tsx (W1004) so the two tests
 * share a fixture shape and any future renames stay localized.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Seed-picker stepper test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (state: { seed: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

vi.mock("./dailyPicker.js", () => ({
  todayStamp: () => "2026-05-02",
  hashStamp: () => 1234567,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage seed-pick popover stepper (W1017)", () => {
  it("decrement button drops the draft seed by 1 without restarting or closing", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker. Draft pre-fills with the current seed (42).
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    const input = screen.getByTestId("play-seed-input") as HTMLInputElement;
    expect(input.value).toBe("42");
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    // Click ▼ — stepSeed(-1) should update the draft to "41".
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-step-down"));
    });

    // Draft decremented...
    expect(input.value).toBe("41");
    // ...active seed unchanged (Apply not clicked)...
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
    // ...popover still open so the user can keep adjusting.
    expect(screen.queryByTestId("play-seed-picker")).toBeTruthy();
  });
});

void React;
