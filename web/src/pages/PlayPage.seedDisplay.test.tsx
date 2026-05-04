/**
 * Unit test for PlayPage seed-display element accessibility (W905).
 *
 * Coverage gap: existing tests (hotkeyD, hotkeyR, hotkeyShiftR, hotkeyN,
 * seedPicker) only assert `seed-display` text content (`#<seed>`). The
 * accessibility attributes — `aria-label="Current deal seed <seed>"` and
 * `title="Current deal seed"` — were never asserted. This test pins
 * those attributes so a future refactor can't silently regress the
 * a11y contract.
 *
 * Strategy:
 *   - vi.hoisted defines a single "klondike" fixture plugin (one of the
 *     three gated ids — klondike/freecell/spider — for which the
 *     prominent toolbar `seed-display` element renders).
 *   - URL seed (`?seed=42`) gives a deterministic initial value so the
 *     aria-label string is fully predictable: "Current deal seed 42".
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
    description: "Seed-display a11y test fixture.",
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

describe("PlayPage seed-display a11y (W905)", () => {
  it("exposes aria-label 'Current deal seed <seed>' and title 'Current deal seed'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    const seedDisplay = screen.getByTestId("seed-display");
    // Sanity: text content matches the canonical "#<seed>" format we
    // already lean on elsewhere — this confirms we found the right node
    // before asserting the (untested) a11y attributes below.
    expect(seedDisplay.textContent).toBe("#42");
    expect(seedDisplay.getAttribute("aria-label")).toBe("Current deal seed 42");
    expect(seedDisplay.getAttribute("title")).toBe("Current deal seed");
  });
});

void React;
