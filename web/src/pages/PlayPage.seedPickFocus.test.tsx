/**
 * W1077 — PlayPage seed-pick popover focus-into on open.
 *
 * Companion to:
 *   - W1009 (info popover focus-into on open)
 *   - W1031 (info popover focus-restore on close)
 *   - W1051 (seed-pick popover Esc focus-restore)
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 661) wires `useFocusTrap(seedPickerRef, seedPickerOpen)`.
 *   When the picker opens, the trap synchronously yanks focus off the trigger
 *   button and onto the first focusable descendant of the popover — which, by
 *   DOM order, is the seed `<input data-testid="play-seed-input">`.
 *
 *   No existing test asserts the focus-INTO direction for the seed picker.
 *   W1051 only covers the inverse (Esc returns focus to trigger). A regression
 *   that dropped the `useFocusTrap` call, removed the input, or broke the
 *   focusable-selector ordering would silently strand keyboard users on the
 *   trigger after opening an `aria-haspopup="dialog"` button — this test pins
 *   exactly that contract.
 *
 * Strategy mirrors PlayPage.seedPickEscFocus.test.tsx (W1051):
 *   - vi.hoisted fixture plugin under id "klondike" so the seed-pick button
 *     renders (gated to klondike/freecell/spider).
 *   - URL `?seed=42` pins deterministic mounting.
 *   - Click trigger, then assert document.activeElement is inside the popover
 *     (and specifically the seed input — the first focusable).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Seed-picker focus-into test fixture.",
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

describe("PlayPage seed-pick popover focus on open (W1077)", () => {
  it("moves focus into the popover (onto the seed input) when opened", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the seed picker.
    const triggerBtn = screen.getByTestId("play-seed-pick-btn") as HTMLButtonElement;
    fireEvent.click(triggerBtn);
    const popover = screen.getByTestId("play-seed-picker");

    // Focus must have left the trigger and landed inside the popover —
    // useFocusTrap picks the first focusable descendant, which by DOM order
    // is the seed input.
    const input = screen.getByTestId("play-seed-input") as HTMLInputElement;
    const active = document.activeElement as HTMLElement | null;
    expect(active).not.toBe(triggerBtn);
    expect(active).not.toBeNull();
    expect(popover.contains(active)).toBe(true);
    expect(active).toBe(input);
  });
});

void React;
