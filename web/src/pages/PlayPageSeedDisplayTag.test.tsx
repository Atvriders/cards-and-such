/**
 * Unit test pinning the PlayPage seed-display element's tagName (W1960).
 *
 * Coverage gap: while `PlayPageSeedDisplayClass.test.tsx` (W1903) pins the
 * className "play-seed-display", `PlayPage.seedDisplay.test.tsx` (W905) pins
 * the a11y attributes (aria-label, title), and many sibling tests assert the
 * "#<seed>" textContent, no test asserts the *element type* of the
 * seed-display node. A refactor that swapped the `<span>` for a `<div>` /
 * `<button>` / `<output>` would silently bypass those assertions because
 * className, testid, aria-label, title, and textContent all transfer
 * unchanged across host elements. This test pins `tagName === "SPAN"` so
 * any structural drift is surfaced immediately.
 *
 * Strategy:
 *   - hoisted klondike fixture (one of the gated ids — klondike /
 *     freecell / spider — for which the prominent toolbar
 *     `seed-display` element renders).
 *   - deterministic URL seed (?seed=42) mirroring W1903.
 *   - exact-equality check on `display.tagName`.
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
    description: "Seed-display tagName test fixture.",
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

describe("PlayPage seed-display tagName (W1960)", () => {
  it('seed-display element tagName === "SPAN"', async () => {
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
    expect(display.tagName).toBe("SPAN");
  });
});

void React;
