/**
 * Unit test for the PlayPage info popover action-log <ol> className
 * (W1490).
 *
 * The action-log section under the info popover renders an <ol> with the
 * literal class `play-action-log` (alongside `data-testid="play-action-log"`
 * for tests). The class is what hooks the rolling breadcrumb list to its
 * scroll/list styling in PlayPage.css. Existing sibling tests pin the
 * <details>/<summary> wrapper className (W1330), the summary cursor
 * (W1477), the empty-state copy (W1379), the entry order (W208), and the
 * <ol> tagName (via expand W1097), but none assert the <ol>'s className
 * attribute itself. A regression that renamed the class (e.g. dropping
 * the `play-` prefix or moving styling to an inline rule) would slip past
 * the existing suite while breaking visual layout in production.
 *
 * Strategy:
 *   - Render PlayPage with a no-op fixture plugin so the info popover
 *     mounts in a deterministic state.
 *   - Click the info button to open the popover.
 *   - Resolve the action-log <ol> via `data-testid="play-action-log"`
 *     and assert its `className` is exactly `"play-action-log"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — vi.hoisted runs before vi.mock factories evaluate,
// so the closure capture below is safe despite resembling a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-ol-classname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Ol ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <ol> className tests.",
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
  vi.restoreAllMocks();
});

describe("PlayPage info popover action-log <ol> className (W1490)", () => {
  it("renders the action-log list with className exactly 'play-action-log'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the info button is available and the
    // action-log section mounts inside the popover.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover so the <details>/<ol> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Resolve the action-log <ol> via its testid and pin the class. Use
    // exact-equality on `className` (not classList.contains) so a stray
    // additional class — e.g. a refactor that pushes layout styles into
    // a new modifier — would still be caught.
    const log = screen.getByTestId("play-action-log");
    expect(log.tagName).toBe("OL");
    expect(log.className).toBe("play-action-log");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
