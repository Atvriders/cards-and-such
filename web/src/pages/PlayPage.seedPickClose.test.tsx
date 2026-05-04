/**
 * W992 — PlayPage seed-pick popover dismisses on Escape.
 *
 * Companion to W991 (which verifies the popover opens). This narrow test
 * exercises the documented dismiss path: pressing Escape while the picker
 * is open closes it without applying any seed change. The keydown listener
 * is bound at the window level (capture phase) inside PlayPage, so we
 * dispatch the event on `window` to match how the browser would deliver
 * it during a real keypress.
 *
 * Strategy mirrors `PlayPage.seedPicker.test.tsx`:
 *   - vi.hoisted fixture plugin registered as the sole game so the route
 *     resolves without pulling in the real registry.
 *   - Plugin id "klondike" so the seed-pick toolbar button renders.
 *   - URL `?seed=42` pins the starting seed for deterministic mounting.
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
    description: "Seed-picker close test fixture.",
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

describe("PlayPage seed-pick popover close (W992)", () => {
  it("dismisses the seed picker when Escape is pressed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker (W991 pattern).
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    expect(screen.getByTestId("play-seed-picker")).toBeTruthy();

    // Press Escape — the close handler is bound to `window` keydown
    // (capture phase) inside PlayPage, so we dispatch there.
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    // Picker should have unmounted.
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });
});

void React;
