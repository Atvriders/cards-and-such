/**
 * W1137 — focused test for the visible *content* inside the
 * `play-paused-overlay` element confirmed by W1122.
 *
 * W1122 already locks the overlay's mount/unmount contract (it must
 * appear only after the user pauses the game). This sibling test
 * narrows further: it asserts that once the overlay mounts, it
 * actually communicates two things to the player:
 *
 *   1. A "Paused" title — so it's obvious the game is suspended.
 *   2. An "Esc" hint — so keyboard users discover the resume keybind.
 *
 * Keeping these two pieces of copy under test guards against a
 * future refactor silently dropping the title or the keybind hint
 * (e.g. swapping `<kbd>Esc</kbd>` for an icon-only affordance) and
 * regressing the overlay's accessibility / discoverability story.
 *
 * Uses `vi.hoisted` for the same TDZ reason documented in the
 * sibling `PlayPage.pausedOverlay.test.tsx`: vi.mock factories run
 * before top-level const initialisers.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — see header comment for the TDZ rationale.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-content-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Content Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1137 paused-overlay content test.",
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

describe("PlayPage paused overlay content (W1137)", () => {
  it("renders a 'Paused' title and an 'Esc' keybind hint inside the overlay", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup screen so the in-game pause surface is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Trigger the pause via the keybind — same path exercised by W1122.
    fireEvent.keyDown(window, { key: "Escape" });

    const overlay = screen.getByTestId("play-paused-overlay");
    expect(overlay).toBeTruthy();

    // Scope queries to the overlay so we don't accidentally match copy
    // elsewhere on the page (e.g. a stray "Paused" status pill).
    const scoped = within(overlay);

    // 1. The overlay must announce that the game is paused.
    expect(scoped.getByText("Paused")).toBeTruthy();

    // 2. The overlay must surface the Esc keybind hint. The literal copy
    //    splits "Press" / "<kbd>Esc</kbd>" / "or click Resume" across
    //    nodes, so match on the <kbd> element's textContent directly
    //    rather than a brittle full-string regex.
    expect(scoped.getByText("Esc").tagName.toLowerCase()).toBe("kbd");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
