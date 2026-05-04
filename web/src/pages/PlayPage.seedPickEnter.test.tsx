/**
 * W1034 — PlayPage seed-pick popover Enter key commits the draft seed.
 *
 * Companion to W1023 (Apply button click), W1004 (stepper does not commit),
 * W1026 (typing updates the draft). Those tests cover the click-to-commit
 * path and the typing-only path, but none exercises the keyboard shortcut
 * wired directly on the input: pressing Enter while focused in the seed
 * input field should commit the draft just like clicking Apply, and close
 * the popover.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1882) renders the seed input with an `onKeyDown`
 *   handler:
 *     onKeyDown={(e) => {
 *       if (e.key === "Enter") {
 *         e.preventDefault();
 *         const n = Number.parseInt(seedDraft, 10);
 *         applyPickedSeed(Number.isFinite(n) && !Number.isNaN(n) ? n : seed);
 *       }
 *     }}
 *   So with draft "77" and active seed 42, pressing Enter on the input
 *   must:
 *     1. Update the active seed-display to "#77"
 *     2. Close the popover (play-seed-picker testid disappears)
 *
 * A regression that removed the Enter handler (or only handled it as a
 * form-submit which never fires because there is no <form>) would silently
 * break the documented keyboard-only seed-entry UX.
 *
 * Strategy mirrors PlayPage.seedPickApply.test.tsx (W1023):
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
    description: "Seed-picker Enter-to-apply test fixture.",
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

describe("PlayPage seed-pick popover Enter (W1034)", () => {
  it("pressing Enter on the seed input commits the draft and closes the popover", async () => {
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
    const input = screen.getByTestId("play-seed-input") as HTMLInputElement;
    expect(input.value).toBe("42");
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
    expect(screen.queryByTestId("play-seed-picker")).toBeTruthy();

    // Type a new draft — does not commit yet (W1026 covers this half).
    act(() => {
      fireEvent.change(input, { target: { value: "77" } });
    });
    expect(input.value).toBe("77");
    // Active seed still 42 — Enter hasn't been pressed.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    // Press Enter on the input — onKeyDown handler should commit the draft
    // via applyPickedSeed(77) and close the popover.
    act(() => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    // Active seed-display now reflects the committed draft...
    expect(screen.getByTestId("seed-display").textContent).toBe("#77");
    // ...and the popover has closed.
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });
});

void React;
