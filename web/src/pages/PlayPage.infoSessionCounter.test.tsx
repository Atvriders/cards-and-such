/**
 * Unit test for the PlayPage info popover "Plays this session" counter
 * (W164 / W593, targeting the W206 PlayPage component).
 *
 * The session counter increments inside `startWithSeed` (called by both
 * the initial Start-playing click and every subsequent newGame). The
 * counter is rendered inside the info popover ("Plays this session" row)
 * which is only mounted while `infoOpen` is true.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin so the mocked registry can
 *     reference it (vi.mock factories run before module-level const
 *     initialisers, so a plain top-level const would be a TDZ violation).
 *   - Click `start-game` to enter playing phase (sessionPlays -> 1).
 *   - Click `new-game-btn` on the end-screen?  No — the end screen only
 *     mounts at game-end. Instead drive newGame via the "n" power-user
 *     shortcut (line 1561 of PlayPage.tsx), which is the same path the
 *     in-game flow uses. confirmIfInProgress() short-circuits to true
 *     while elapsed === 0 && actionCountRef.current === 0, so no confirm
 *     dialog appears.
 *   - Wrap each "n" press in `act` and flush microtasks so the async
 *     newGame settles before we assert.
 *   - Open the info popover via `play-info-btn` and assert the counter
 *     row's value matches the expected count (initial start + N newGames).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — vi.hoisted runs before vi.mock factories evaluate,
// so the closure capture below is safe despite resembling a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-session-counter-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Session Counter Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover session-counter tests.",
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

/**
 * Read the "Plays this session" value from the open info popover.
 * The popover mounts a sequence of `play-info-popover-row` divs, each
 * holding a label + value sibling. We locate the row whose label text is
 * "Plays this session" and return its value as a number.
 */
function readSessionCount(): number {
  const popover = screen.getByTestId("play-info-popover");
  const labels = popover.querySelectorAll(".play-info-label");
  for (const label of Array.from(labels)) {
    if (label.textContent?.trim() === "Plays this session") {
      const value = label.nextElementSibling;
      const raw = value?.textContent?.trim() ?? "";
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  throw new Error("Plays this session row not found in info popover");
}

describe("PlayPage info popover plays-this-session counter (W164)", () => {
  it("increments on each new game and reflects the latest count when the info popover opens", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Initial Start-playing click bumps sessionPlays from 0 -> 1.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive three additional newGames via the "n" power-user shortcut.
    // newGame is async (it awaits confirmIfInProgress) but short-circuits
    // synchronously while elapsed === 0 && actionCount === 0, so wrapping
    // each press in act + a flushed microtask is enough to settle React.
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        fireEvent.keyDown(window, { key: "n" });
        // Flush the microtask queue so the awaited startWithSeed commits.
        await Promise.resolve();
      });
    }

    // Open the info popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // 1 (initial start) + 3 (newGames via "n") = 4 plays this session.
    expect(readSessionCount()).toBe(4);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
