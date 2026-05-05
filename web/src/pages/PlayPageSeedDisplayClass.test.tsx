/**
 * Unit test pinning the PlayPage seed-display className (W1903).
 *
 * Coverage gap: while `PlayPage.seedDisplay.test.tsx` pins the a11y
 * attributes (aria-label, title) and other tests assert text content,
 * the seed-display element's `className` exact value
 * ("play-seed-display") was never asserted. A refactor that renamed or
 * appended to that class would silently bypass our existing assertions
 * since the testid alone would still resolve. This test pins the exact
 * className so any drift is surfaced immediately.
 *
 * Strategy:
 *   - hoisted klondike fixture (one of the gated ids — klondike /
 *     freecell / spider — for which the prominent toolbar
 *     `seed-display` element renders).
 *   - deterministic URL seed for stable rendering.
 *   - exact-equality check on `display.className`.
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
    description: "Seed-display className test fixture.",
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage seed-display className (W1903)", () => {
  it('seed-display element className === "play-seed-display"', async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    const display = screen.getByTestId("seed-display");
    expect(display.className).toBe("play-seed-display");
  });
});

void React;
