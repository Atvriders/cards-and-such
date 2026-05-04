/**
 * Unit test for PlayPage info popover Escape-key dismiss behavior (W1014).
 *
 * Analog of W1000 (howToPlay Escape close) for the info popover surface.
 * Sibling W740 covers the I-toggle (open/close via the `i` hotkey); this
 * test covers the *other* dismissal path: while the popover is open,
 * pressing Escape should close it (PlayPage.tsx ~lines 1505-1519).
 *
 * The Escape handler is registered on `window` in capture-free phase, so
 * dispatching the event on `window` matches the production code path.
 * The popover unmount (queryByTestId("play-info-popover") -> null) is the
 * observable signal that `setInfoOpen(false)` ran.
 *
 * Strategy:
 *   - Mock the registry with a minimal one-game fixture so PlayPage mounts
 *     without dragging real reducers / win conditions in.
 *   - Advance past the setup screen so the in-game toolbar mounts and the
 *     info button is reachable.
 *   - Open the popover via its toolbar button, then dispatch Escape on
 *     `window` and assert the popover element disappears from the DOM.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-esc-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Esc Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover Escape-dismiss test.",
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

describe("PlayPage info popover Escape dismisses (W1014)", () => {
  it("pressing Escape while the info popover is open closes it (popover unmounts)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the in-game
    // toolbar (with the info button) mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover via its toolbar button.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Dispatch Escape on window — that's where the popover's Esc handler
    // listens (window.addEventListener in PlayPage.tsx ~line 1517).
    fireEvent.keyDown(window, { key: "Escape" });

    // After setInfoOpen(false) runs, the popover element is removed from
    // the DOM (it's gated on `infoOpen && (...)` in the JSX).
    expect(screen.queryByTestId("play-info-popover")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
