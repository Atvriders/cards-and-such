/**
 * Unit test for PlayPage hint-pulse lifecycle (W496).
 *
 * Verifies that clicking the in-game `play-hint-btn`:
 *   1. Calls the plugin's `hint(state)` to obtain a CSS selector
 *   2. Adds the `hint-pulse` class to the matched element
 *   3. Removes the `hint-pulse` class after `pulses * 500ms`
 *
 * Uses RTL to mount PlayPage with a fixture plugin whose Game.tsx renders
 * an element matching the selector, and vitest fake timers to advance
 * deterministically through the pulse window.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// -----------------------------------------------------------------------
// Fixture plugin. `hint()` returns a known selector + explicit `pulses`
// count so the test can assert the exact lifetime of the `hint-pulse`
// class. The Game.tsx component renders an element matching that
// selector so `document.querySelector` resolves on the page.
// -----------------------------------------------------------------------
const TEST_GAME_ID = "hint-pulse-fixture";
const PULSES = 4; // 4 * 500ms = 2000ms total pulse window

const fixturePlugin = {
  id: TEST_GAME_ID,
  title: "Hint Pulse Fixture",
  category: "cards" as const,
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test-only plugin for hint-pulse lifecycle tests.",
  settings: {} as Record<string, never>,
  initialState: () => ({ moves: 0 }),
  reducer: (state: { moves: number }) => state,
  isTerminal: () => null,
  hint: () => ({ selector: "[data-testid='hint-target']", pulses: PULSES }),
  component: () => (
    <div>
      <div data-testid="hint-target">target</div>
    </div>
  ),
};

// `klondike` fixture keeps any registry-coupled lobby code rendering
// without pulling in the full real registry.
const klondikeFixture = { ...fixturePlugin, id: "klondike", title: "Klondike" };

vi.mock("../games/registry.js", () => ({
  GAMES: [fixturePlugin, klondikeFixture],
}));

// Hints are gated by a Settings → Gameplay toggle (`cards-hints-enabled`,
// default true). We make the on-state explicit so the test isn't subject
// to default-changes elsewhere.
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("cards-hints-enabled", "true");
  // The button-cooldown gate would also block our second-tier assertions
  // if it was ever enabled by another test; explicitly turn it off.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe("PlayPage hint pulse lifecycle", () => {
  it("adds .hint-pulse on click and removes it after pulses * 500ms", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the toolbar (with the Hint button)
    // mounts and the Game.tsx renders the hint target. The Game component
    // is rendered inside <Suspense>, but our fixture is eagerly imported
    // so it commits in the same render pass as the setPhase("playing").
    fireEvent.click(screen.getByTestId("start-game"));

    const target = screen.getByTestId("hint-target");
    expect(target.classList.contains("hint-pulse")).toBe(false);

    // Switch to fake timers AFTER the React tree is committed to playing
    // mode — installing them earlier would freeze any microtask the
    // start-phase effects depend on.
    vi.useFakeTimers();

    // Click the Hint button — the plugin's selector should match `target`
    // and `hint-pulse` should be applied synchronously.
    fireEvent.click(screen.getByTestId("play-hint-btn"));
    expect(target.classList.contains("hint-pulse")).toBe(true);

    // The class should still be present just before the pulse window ends.
    const totalMs = PULSES * 500;
    act(() => {
      vi.advanceTimersByTime(totalMs - 1);
    });
    expect(target.classList.contains("hint-pulse")).toBe(true);

    // After pulses * 500ms the cleanup timer fires and removes the class.
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(target.classList.contains("hint-pulse")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
