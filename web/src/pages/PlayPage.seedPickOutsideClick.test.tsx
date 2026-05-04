/**
 * W1002 — PlayPage seed-pick popover dismisses on outside click.
 *
 * Analog of W992 (Escape dismiss). The same effect that listens for Escape
 * also installs a `mousedown` listener on `window` that closes the picker
 * whenever the event target is outside both the picker container and the
 * trigger button (PlayPage.tsx ~line 682-693). This narrow test exercises
 * that outside-click branch.
 *
 * Strategy mirrors `PlayPage.seedPickClose.test.tsx`:
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
    description: "Seed-picker outside-click test fixture.",
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

describe("PlayPage seed-pick popover outside-click (W1002)", () => {
  it("dismisses the seed picker when mousedown fires outside it", async () => {
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

    // Mousedown on document.body — outside both the picker container
    // and the trigger button, so the outside-click handler should close
    // the popover. The handler is bound to `window` mousedown inside
    // PlayPage, and bubbles from body up to window.
    act(() => {
      fireEvent.mouseDown(document.body);
    });

    // Picker should have unmounted.
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });
});

void React;
