/**
 * W1027 — PlayPage seed-pick popover stepper clamps the draft at 0.
 *
 * Companion to W1004 (▲ stepper) and W1017 (▼ stepper). Those tests pin the
 * happy-path increment/decrement contract on a non-zero draft. This test pins
 * the boundary contract so a regression that drops the `Math.max(0, …)` clamp
 * — and lets the draft slide negative — cannot slip through.
 *
 * Source of truth (PlayPage.tsx ~line 897, `stepSeed`):
 *
 *     const next = Math.max(0, base + delta);
 *
 * Translated: when the current draft parses to 0 and the user clicks ▼,
 * `stepSeed(-1)` clamps `next` back to 0 instead of producing -1. The displayed
 * input value must therefore stay at "0" across the click, the active game
 * seed must remain unchanged (Apply hasn't fired), and the popover must stay
 * open so the user can keep adjusting.
 *
 * Mounting at `?seed=0` reaches the boundary directly without depending on
 * an unrelated stepper sequence to drive the draft down to zero first.
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
    description: "Seed-picker stepper boundary test fixture.",
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

describe("PlayPage seed-pick popover stepper boundary (W1027)", () => {
  it("decrement at draft=0 clamps to 0 (no negative seed) without restarting or closing", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=0`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker. Draft pre-fills with the current seed (0).
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    const input = screen.getByTestId("play-seed-input") as HTMLInputElement;
    expect(input.value).toBe("0");
    expect(screen.getByTestId("seed-display").textContent).toBe("#0");

    // Click ▼ at the boundary — stepSeed(-1) must clamp to 0, not -1.
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-step-down"));
    });

    // Draft clamped at 0 (Math.max(0, base + delta))...
    expect(input.value).toBe("0");
    // ...active seed unchanged (Apply not clicked)...
    expect(screen.getByTestId("seed-display").textContent).toBe("#0");
    // ...popover still open so the user can keep adjusting.
    expect(screen.queryByTestId("play-seed-picker")).toBeTruthy();
  });
});

void React;
