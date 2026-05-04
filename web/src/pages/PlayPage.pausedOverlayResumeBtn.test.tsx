/**
 * W1188 — focused test for the paused overlay's Resume button UI contract.
 *
 * W1146 covered the click-to-resume behavior. W1137 covered the overlay
 * surrounding text. This test pins the *button itself*: it must be a
 * plain native <button> element with the visible label "Resume" — the
 * specific button referenced by the overlay hint "Press Esc or click
 * Resume" (PlayPage.tsx ~L2554).
 *
 * The toolbar's pause control also exposes a "Resume" aria-label while
 * paused, so this test scopes lookups to the overlay via within().
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-resume-btn-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Resume Btn Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1188 overlay Resume button label test.",
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

describe("PlayPage paused overlay Resume button label (W1188)", () => {
  it("renders a native <button> with visible text 'Resume' inside the overlay", async () => {
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

    // Pause via Escape so the overlay (and its Resume button) are mounted.
    fireEvent.keyDown(window, { key: "Escape" });
    const overlay = screen.getByTestId("play-paused-overlay");
    expect(overlay).toBeTruthy();

    // Scope to the overlay — the toolbar's pause control also carries
    // the "Resume" aria-label when paused, so an unscoped role query
    // would match two buttons. within() guarantees we hit the in-card one.
    const resumeBtn = within(overlay).getByRole("button", { name: "Resume" });

    // UI contract: it's a real <button> element (not a div/anchor).
    expect(resumeBtn.tagName).toBe("BUTTON");

    // UI contract: the visible label is exactly "Resume" — matches the
    // copy promised by the overlay hint "Press Esc or click Resume".
    expect(resumeBtn.textContent?.trim()).toBe("Resume");
  });
});

void React;
