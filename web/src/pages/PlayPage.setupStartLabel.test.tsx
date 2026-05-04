/**
 * Unit test for PlayPage setup-screen Start button label (W1084).
 *
 * What this guards: while `phase === "setup"` the setup panel renders a
 * single primary action — the start-game button — and its visible text MUST
 * read "Start playing". The label is the *only* call-to-action a player sees
 * before the game begins, so a copy regression (e.g. someone shortening it
 * to "Start" or shipping a translation key like "play.start") would silently
 * degrade the first-time experience for every game in the hub.
 *
 * Why this is worth its own test:
 *   - Existing setup coverage is behavioural: `PlayPage.setupSettingsApplied`
 *     verifies the click wires settings into `initialState`, but it locates
 *     the button purely by `data-testid` and never asserts the label. Many
 *     other tests (`PlayPage.newGame`, `PlayPage.settingsPersist`, etc.) do
 *     the same — they click `getByTestId("start-game")` and move on. None of
 *     them would notice if the visible text drifted away from "Start
 *     playing".
 *   - The label is the public-facing copy for every plugin's pre-start
 *     screen, so it deserves a focused guard independent of any one game's
 *     fixture.
 *
 * Strategy:
 *   - `vi.hoisted` builds a minimal fixture plugin (no settings schema)
 *     so the setup panel renders cleanly and the start button is the only
 *     focusable control of interest.
 *   - We assert both the testid (anchor — proves we're looking at the right
 *     element) and the visible text content (the actual contract under test).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-start-label-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Setup Start Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for setup-screen Start button label test.",
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

describe("PlayPage setup-screen Start button label (W1084)", () => {
  it("renders the start-game button with the visible label 'Start playing'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor: setup panel is mounted while phase === "setup".
    expect(screen.getByTestId("setup-panel")).toBeTruthy();

    // Locate the button via its testid (stable anchor) and assert the
    // visible label — the contract under test.
    const startBtn = screen.getByTestId("start-game") as HTMLButtonElement;
    expect(startBtn.tagName).toBe("BUTTON");
    expect(startBtn.textContent).toBe("Start playing");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
