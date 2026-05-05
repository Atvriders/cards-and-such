/**
 * Unit test pinning the PlayPage seed-display element's lack of an
 * `id` attribute (W2034).
 *
 * Coverage gap: existing seed-display tests assert className,
 * data-testid, aria-label, title, and textContent. None pin the
 * absence of the `id` attribute. The current implementation renders
 * the seed-display `<span>` without an `id`; a future refactor that
 * adds one (e.g. for label association or anchor linking) would
 * silently change DOM identity semantics. This test pins the
 * intentional omission so any drift is surfaced.
 *
 * Strategy:
 *   - hoisted klondike fixture (one of the gated ids — klondike /
 *     freecell / spider — for which the prominent toolbar
 *     `seed-display` element renders).
 *   - deterministic URL seed for stable rendering.
 *   - assert `el.hasAttribute("id") === false`.
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
    description: "Seed-display no-id test fixture.",
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

describe("PlayPage seed-display no id attribute (W2034)", () => {
  it('seed-display element has no "id" attribute', async () => {
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
    expect(display.hasAttribute("id")).toBe(false);
  });
});

void React;
