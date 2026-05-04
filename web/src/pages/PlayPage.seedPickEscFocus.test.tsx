/**
 * W1051 — PlayPage seed-pick popover Escape restores focus to the trigger.
 *
 * Companion to W992 (Escape closes the popover) and W1034 (Enter on the
 * input commits). W992 only asserts the picker unmounts; it never observes
 * the focus-restoration side-effect of the Escape handler. W1034 covers a
 * different key on the input. Neither test exercises the Escape path while
 * the seed input itself holds focus, nor verifies that focus returns to
 * the seed-pick toolbar button — both required for keyboard-only UX so a
 * dismissed dialog doesn't strand focus on a detached element.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 670–695) registers a window-capture keydown listener
 *   while `seedPickerOpen` is true:
 *     if (e.key === "Escape") {
 *       e.preventDefault();
 *       e.stopPropagation();
 *       setSeedPickerOpen(false);
 *       seedPickerBtnRef.current?.focus();
 *     }
 *   So with the input focused, pressing Escape must:
 *     1. Close the popover (play-seed-picker testid disappears).
 *     2. Move document.activeElement back to the seed-pick trigger button
 *        (data-testid="play-seed-pick-btn").
 *
 * A regression that dropped the `seedPickerBtnRef.current?.focus()` line —
 * or only handled Escape on the input rather than at window capture — would
 * silently break keyboard navigation for screen-reader and tab-only users.
 *
 * Strategy mirrors PlayPage.seedPickClose.test.tsx (W992) and
 * PlayPage.seedPickEnter.test.tsx (W1034):
 *   - vi.hoisted fixture plugin under id "klondike" so the seed-pick button
 *     renders (gated to klondike/freecell/spider).
 *   - URL `?seed=42` pins the starting state for deterministic mounting.
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
    description: "Seed-picker Esc focus-restore test fixture.",
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

describe("PlayPage seed-pick popover Esc focus restore (W1051)", () => {
  it("pressing Escape while the seed input is focused closes the popover and restores focus to the trigger button", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker.
    const triggerBtn = screen.getByTestId("play-seed-pick-btn") as HTMLButtonElement;
    fireEvent.click(triggerBtn);
    expect(screen.getByTestId("play-seed-picker")).toBeTruthy();

    // Move focus into the seed input — simulating a keyboard user who
    // tabbed into the dialog or began typing a custom seed.
    const input = screen.getByTestId("play-seed-input") as HTMLInputElement;
    act(() => {
      input.focus();
    });
    expect(document.activeElement).toBe(input);

    // Press Escape — window-capture handler should preempt input default
    // behavior, close the popover, and restore focus to the trigger.
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    // Popover unmounted...
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
    // ...and focus is back on the seed-pick toolbar button.
    expect(document.activeElement).toBe(triggerBtn);
  });
});

void React;
