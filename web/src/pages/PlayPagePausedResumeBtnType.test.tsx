/**
 * W1273 — focused test for the paused overlay Resume button's `type="button"`
 * attribute.
 *
 * The Resume button inside the paused overlay (PlayPage.tsx ~L2554) is
 * rendered with an explicit `type="button"` attribute. Without this,
 * browsers default <button> elements inside a <form> ancestor to
 * `type="submit"`, which would unintentionally trigger form submission
 * on click. Existing tests cover the button's label, native tag, and
 * click-to-resume behavior, but not this `type` attribute. This test
 * pins it so a refactor that drops the explicit type fails loudly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-resume-btn-type-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Resume Btn Type Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1273 Resume button type attr test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage paused overlay Resume button type attribute (W1273)", () => {
  it("renders the overlay Resume button with explicit type='button'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup into the playing phase.
    fireEvent.click(screen.getByTestId("start-game"));

    // Click the toolbar pause button to open the overlay.
    fireEvent.click(screen.getByTestId("play-pause-btn"));

    const overlay = screen.getByTestId("play-paused-overlay");
    expect(overlay).toBeTruthy();

    // Scope to the overlay — the toolbar's pause control also exposes a
    // "Resume" aria-label while paused, so an unscoped role query would
    // match two buttons.
    const resumeBtn = within(overlay).getByRole("button", { name: "Resume" });

    // UI contract: explicit type="button" prevents accidental form
    // submission if a <form> ancestor is ever introduced.
    expect(resumeBtn.getAttribute("type")).toBe("button");
  });
});

void React;
