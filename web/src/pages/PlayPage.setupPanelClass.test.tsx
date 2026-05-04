/**
 * Unit test for PlayPage setup-panel className (W1120).
 *
 * What this guards: while `phase === "setup"` the panel rendered at line
 * 2411 of PlayPage.tsx is `<section className="setup-panel" ...>`. The
 * literal `setup-panel` class string is the CSS hook that the global
 * stylesheet keys off — a regression that renamed the class (e.g. to
 * `setupPanel`, `play-setup-panel`, or dropped it altogether) would
 * silently kill the panel's styling without breaking any testid lookup
 * or visible text.
 *
 * Why this is worth its own test:
 *   - W1091 (`PlayPage.setupContent`) covers the howToPlay heading.
 *   - W1084 / W1085 cover the Start button label and class.
 *   - W1104 (`PlayPage.setupPanelSection`) covers the `<section>` tag.
 *   - None of the existing tests pin the *className value* of the panel
 *     itself, leaving the CSS contract unguarded.
 *
 * Strategy:
 *   - Reuse the same minimal-fixture pattern as the sibling W1104 test.
 *   - Resolve the panel via its testid, then assert `classList` contains
 *     the literal `setup-panel` token.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-panel-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Setup Panel Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for setup-panel className test.",
    settings: {},
    initialState: (_seed: number, _settings: Record<string, never>) => ({ moves: 0 }),
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
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage setup-panel className (W1120)", () => {
  it("renders the setup panel with the literal `setup-panel` class", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("setup-panel");
    expect(panel).toBeTruthy();
    // CSS contract: the panel carries the literal `setup-panel` class
    // token so the global stylesheet's `.setup-panel { ... }` rule binds.
    expect(panel.classList.contains("setup-panel")).toBe(true);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
