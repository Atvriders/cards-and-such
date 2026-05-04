/**
 * Unit test for the per-game tutorial overlay's backdrop attributes (W1416).
 *
 * The PlayPage auto-mounts the Tutorial overlay on first visit for plugin
 * ids registered in `platform/tutorials.ts`. The backdrop SVG used to cut
 * out the highlighted region is purely decorative and must therefore be
 * marked `aria-hidden="true"` so screen readers do not announce it as part
 * of the dialog content. The existing `PlayPage.tutorialCoachmark.test.tsx`
 * only asserts the tooltip + dialog role; this file adds the missing
 * coverage for the backdrop's `aria-hidden` attribute and stable
 * `data-testid`/`className` pair.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin reusing the klondike id for tutorial coverage.",
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  cleanup();
  vi.restoreAllMocks();
});

describe("PlayPage tutorial backdrop aria-hidden (W1416)", () => {
  it("marks the auto-launched tutorial backdrop SVG as aria-hidden so screen readers skip the decorative cutout", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup so the auto-launch effect fires.
    fireEvent.click(screen.getByTestId("start-game"));

    const backdrop = screen.getByTestId("tutorial-backdrop");
    expect(backdrop.tagName.toLowerCase()).toBe("svg");
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.classList.contains("tutorial-backdrop")).toBe(true);
  });
});

void React;
