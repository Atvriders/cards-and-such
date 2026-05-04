/**
 * W1024 — PlayPage seed-pick popover Random button updates the draft input.
 *
 * Companion to W205/W324 (PlayPage.seedPicker.test.tsx) and W1004
 * (PlayPage.seedPickStep.test.tsx). W205/W324 already pins the *committed*
 * effect of clicking Random — that the prominent `seed-display` element
 * reflects a new (Math.random-derived) seed and that the popover dismisses.
 * W1004 explicitly notes that "Random/Daily" paths are covered there.
 *
 * What none of those pins is the *draft input's* value transition: that
 * the `play-seed-input` field, which mirrors `seedDraft` state, actually
 * advances away from the URL-supplied "42" after Random fires. This is a
 * distinct observable from the seed-display text — a regression that
 * stopped calling `setSeedDraft(String(r))` (PlayPage.tsx ~line 1920)
 * before `applyPickedSeed` would still update the active seed and the
 * displayed `#NNN` (because the seed-sync `useEffect` at line 666
 * re-syncs the draft from the new `seed`). But the contract documented
 * inline at the Random handler is that it updates the draft *first*,
 * giving the user feedback in the input field if they reopen the picker
 * to confirm the chosen seed before any further action.
 *
 * Observable behavior:
 *   PlayPage.tsx ~line 1915 wires the Random button to:
 *     onClick={() => {
 *       const r = randomSeed();
 *       setSeedDraft(String(r));
 *       applyPickedSeed(r);          // closes the popover, restarts game
 *     }}
 *   So after clicking Random and reopening the picker, the
 *   `play-seed-input` element's value must be a non-"42" numeric string.
 *
 * Strategy mirrors PlayPage.seedPickStep.test.tsx (W1004):
 *   - vi.hoisted fixture plugin under id "klondike" so the seed-pick
 *     toolbar branch (gated to klondike/freecell/spider) renders.
 *   - URL `?seed=42` pins the starting draft to "42".
 *   - Pin Math.random so the new seed is deterministic and provably
 *     != 42 (0.5 -> 1073741824, well outside any 0-255 collision window).
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
    description: "Seed-picker Random draft test fixture.",
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

describe("PlayPage seed-pick popover Random draft (W1024)", () => {
  it("Random updates the picker input draft to a non-42 number", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Pin Math.random so the new seed is predictable and provably != 42.
    // randomSeed() = Math.floor(Math.random() * 2 ** 31), so 0.5 -> 1073741824.
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    // Open the popover and assert the draft starts at 42 (URL-supplied seed).
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    const initialInput = screen.getByTestId("play-seed-input") as HTMLInputElement;
    expect(initialInput.value).toBe("42");

    // Click Random — this also closes the popover via applyPickedSeed.
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-random"));
    });

    // Reopen the popover to inspect the persisted draft value. The seed-sync
    // effect re-fills the draft from the now-updated active seed, so the
    // input's value must reflect the new randomized seed (not "42").
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    const reopenedInput = screen.getByTestId("play-seed-input") as HTMLInputElement;

    expect(reopenedInput.value).not.toBe("42");
    // Sanity-check that the new draft parses as a finite non-NaN number.
    const parsed = Number.parseInt(reopenedInput.value, 10);
    expect(Number.isFinite(parsed)).toBe(true);
    expect(Number.isNaN(parsed)).toBe(false);
  });
});

void React;
