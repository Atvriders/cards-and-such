/**
 * W1023 — PlayPage seed-pick popover Apply button commits the draft seed.
 *
 * Companion to W1004 (stepper bumps the draft without restarting). W1004
 * deliberately stops short of clicking Apply so it can isolate the "edit
 * doesn't restart" half of the contract. That leaves the *other* half —
 * "Apply commits the draft and closes the popover" — covered only
 * indirectly by the seedPicker Random/Daily paths in W205/W324, neither of
 * which exercises the literal Apply button (`data-testid="play-seed-apply"`).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1941) renders the Apply button with
 *   `onClick={() => applyPickedSeed(parseInt(seedDraft) || seed)}`.
 *   `applyPickedSeed` (~line 886) calls `startWithSeed(safe)` and then
 *   `setSeedPickerOpen(false)`. So with draft "43" and active seed 42,
 *   clicking Apply must:
 *     1. Update the active seed-display to "#43"
 *     2. Close the popover (play-seed-picker testid disappears)
 *
 * A regression that wired Apply only to draft mutation (no startWithSeed)
 * or that left the popover open after commit would silently break the
 * documented "edit then apply" UX. W1004 catches the inverse — this test
 * pins the commit step W1004 explicitly skipped.
 *
 * Strategy mirrors PlayPage.seedPickStep.test.tsx (W1004):
 *   - vi.hoisted fixture plugin under id "klondike" so the seed-display
 *     element renders (gated to klondike/freecell/spider).
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
    description: "Seed-picker Apply test fixture.",
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

describe("PlayPage seed-pick popover Apply (W1023)", () => {
  it("clicking Apply commits the draft seed and closes the popover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker. Active seed is #42; draft pre-fills with 42.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
    expect(screen.queryByTestId("play-seed-picker")).toBeTruthy();

    // Bump the draft to 43 via the stepper (does not commit yet — see W1004).
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-step-up"));
    });
    expect((screen.getByTestId("play-seed-input") as HTMLInputElement).value).toBe("43");
    // Active seed still 42 — Apply hasn't been clicked.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    // Click Apply — applyPickedSeed(43) should restart with seed 43 and
    // close the popover.
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-apply"));
    });

    // Active seed-display now reflects the committed draft...
    expect(screen.getByTestId("seed-display").textContent).toBe("#43");
    // ...and the popover has closed.
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });
});

void React;
