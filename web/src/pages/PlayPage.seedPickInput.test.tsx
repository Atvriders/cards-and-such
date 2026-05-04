/**
 * W1026 — PlayPage seed-pick popover draft text input updates on typing.
 *
 * Companion to W1004 (stepper) and W205/W324 (Random/Daily/Apply). Those tests
 * cover the ▲/▼ buttons and the three commit actions, but none exercises the
 * primary mode of seed entry: typing directly into the input.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1873) renders the `<input data-testid="play-seed-input">`
 *   as a controlled input bound to `seedDraft`, with
 *   `onChange={(e) => setSeedDraft(e.target.value)}`. Typing into the input
 *   should update the input's displayed value (the draft) without affecting
 *   the active game seed until Apply is clicked.
 *
 * A regression that broke the onChange handler (or made the input uncontrolled)
 * would silently break manual seed entry without tripping any existing test.
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
    description: "Seed-picker input typing test fixture.",
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

describe("PlayPage seed-pick popover input typing (W1026)", () => {
  it("typing into the seed input updates the draft and Apply commits it", async () => {
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

    // Type a new value — onChange should update the draft state.
    act(() => {
      fireEvent.change(input, { target: { value: "999" } });
    });

    // Draft reflects the typed value...
    expect(input.value).toBe("999");
    // ...active seed unchanged until Apply.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    // Apply commits the draft as the new active seed.
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-apply"));
    });
    expect(screen.getByTestId("seed-display").textContent).toBe("#999");
  });
});

void React;
