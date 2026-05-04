/**
 * W1122 — focused test for the `play-paused-overlay` element discovered
 * during W1119's accessibility audit of the in-game pause surface.
 *
 * The overlay is render-gated on the `paused` state inside PlayPage.tsx
 * (`{paused && (<div ... data-testid="play-paused-overlay" .../>)}`).
 * This test asserts that single contract narrowly:
 *
 *   1. After advancing past the setup screen into the playing phase,
 *      the overlay must NOT be in the DOM (paused defaults to false).
 *   2. Pressing the Escape key (with focus on document.body, outside
 *      any modal / form surface) must toggle paused → true and mount
 *      the overlay.
 *
 * This is intentionally narrower than `PlayPage.pause.test.tsx`, which
 * also covers the click-toggle path and the timer-freeze invariant.
 * Keeping a dedicated mount/unmount assertion for the overlay makes it
 * survive future refactors that fold the click-toggle into a different
 * harness (e.g. when the timer-freeze becomes its own integration suite).
 *
 * Uses `vi.hoisted` so the registry mock can reference the fixture
 * plugin without tripping a TDZ error — vi.mock factories run before
 * top-level const initialisers, so a plain `const fixturePlugin = ...`
 * referenced from inside `vi.mock(...)` would explode.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — see header comment for the TDZ rationale.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1122 paused-overlay mount test.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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

describe("PlayPage paused overlay (W1122)", () => {
  it("mounts play-paused-overlay only after Escape pauses the game", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup screen into the playing phase so the toolbar
    // and pause-handling effects are mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Initially playing — paused defaults to false, so the overlay must
    // not be present in the DOM.
    expect(screen.queryByTestId("play-paused-overlay")).toBeNull();

    // Escape on document.body (not focused inside an input / textarea /
    // contenteditable) hits the pause-toggle keydown handler.
    fireEvent.keyDown(window, { key: "Escape" });

    // The overlay element must now be in the DOM, gated by `paused`.
    expect(screen.getByTestId("play-paused-overlay")).toBeTruthy();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
