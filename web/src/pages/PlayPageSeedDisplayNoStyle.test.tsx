/**
 * Unit test pinning the PlayPage seed-display element's lack of an
 * inline `style` attribute (W2113).
 *
 * Coverage gap: existing seed-display tests assert className,
 * data-testid, aria-label, title, textContent, tag, and the absence
 * of an `id`. None pin the absence of an inline `style` attribute.
 * The current implementation renders the seed-display `<span>`
 * relying entirely on the `play-seed-display` class for styling; a
 * future refactor that introduces an inline `style="..."` would
 * silently couple presentation to JS and break theme-only styling.
 * This test pins the intentional omission so any drift is surfaced.
 *
 * Strategy:
 *   - hoisted klondike fixture (one of the gated ids — klondike /
 *     freecell / spider — for which the prominent toolbar
 *     `seed-display` element renders).
 *   - deterministic URL seed for stable rendering.
 *   - assert `el.hasAttribute("style") === false`.
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
    description: "Seed-display no-style test fixture.",
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

describe("PlayPage seed-display no style attribute (W2113)", () => {
  it('seed-display element has no "style" attribute', async () => {
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
    expect(display.hasAttribute("style")).toBe(false);
  });
});

void React;
