/**
 * Unit test for the PlayPage "I" hotkey that toggles the info popover (W740).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing the unmodified `i`
 *   key flips `infoOpen`, mounting/unmounting the info popover element
 *   (PlayPage.tsx ~line 1598). Sibling tests cover other hotkeys
 *   (F=favorite, Escape=pause/settings, N=newGame) but no test exercises
 *   the I binding, leaving its toggle path an untested edge.
 *
 * Strategy:
 *   - Mock the registry with a minimal one-game fixture so PlayPage mounts
 *     without dragging real reducers / win conditions in.
 *   - Advance past the setup screen so phase === "playing" and the
 *     window-level keydown handler that owns the I binding is mounted.
 *   - Dispatch the `i` key on `window` (handler attaches there) and assert
 *     the popover element appears, then again to assert it disappears.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "hotkey-i-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hotkey I Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the I-hotkey info-popover toggle test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship — null-stub keeps any
// stray render path side-effect-free.
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
  vi.restoreAllMocks();
});

describe("PlayPage I hotkey toggles info popover (W740)", () => {
  it("pressing I while playing opens the popover; pressing again closes it", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the I binding is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: popover starts closed.
    expect(screen.queryByTestId("play-info-popover")).toBeNull();

    // Toggle ON via the unmodified I keybinding.
    fireEvent.keyDown(window, { key: "i" });
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Toggle OFF — the same key flips the boolean back.
    fireEvent.keyDown(window, { key: "i" });
    expect(screen.queryByTestId("play-info-popover")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
