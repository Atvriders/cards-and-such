/**
 * W1004 — PlayPage seed-pick popover stepper increments the draft seed.
 *
 * Companion to W991 (popover opens), W992 (Esc dismiss), W1002 (outside-click
 * dismiss), and the W205/W324 Random/Daily/Apply path tests. Those tests
 * pin the popover container's a11y contract and the three top-level
 * "commit" actions, but none exercises the in-popover ▲ / ▼ stepper.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 897) defines `stepSeed(delta)` which mutates only
 *   the `seedDraft` string state — it does NOT restart the game. The ▲
 *   button (`data-testid="play-seed-step-up"`, `aria-label="Increment seed"`)
 *   wires `onClick={() => stepSeed(1)}`. So clicking ▲ once with a draft
 *   of "42" must:
 *     1. Bump the input's displayed value to "43"
 *     2. Leave the active game seed unchanged (still #42 per the prominent
 *        seed-display element) — Apply hasn't been clicked
 *     3. Leave the popover open so the user can keep adjusting
 *
 * A regression that wired the stepper to `applyPickedSeed` directly, or
 * that closed the popover on step, would silently break the documented
 * "edit then apply" UX without tripping any existing test.
 *
 * Strategy mirrors PlayPage.seedPicker.test.tsx (W205/W324):
 *   - vi.hoisted fixture plugin under id "klondike" so the seed-display
 *     element renders (gated to klondike/freecell/spider) and gives us a
 *     simple observable for the active seed.
 *   - URL `?seed=42` pins the starting draft and active seed.
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

describe("PlayPage seed-pick popover stepper (W1004)", () => {
  it("increment button bumps the draft seed by 1 without restarting or closing", async () => {
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

    // Click ▲ — stepSeed(+1) should update the draft to "43".
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-step-up"));
    });

    // Draft incremented...
    expect(input.value).toBe("43");
    // ...active seed unchanged (Apply not clicked)...
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
    // ...popover still open so the user can keep adjusting.
    expect(screen.queryByTestId("play-seed-picker")).toBeTruthy();
  });
});

void React;
