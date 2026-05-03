/**
 * Unit test for the PlayPage info popover seed display (W164).
 *
 * Asserts that opening the info popover (`play-info-btn`) renders the
 * current seed inside the popover's "Seed" row. The seed is supplied via
 * the URL `?seed=42` query param so the test is deterministic and does
 * not depend on `randomSeed()` or any persisted last-seed value.
 *
 * Strategy mirrors PlayPage.infoSessionCounter.test.tsx:
 *   - `vi.hoisted` builds a fixture plugin so the mocked registry can
 *     reference it without a TDZ violation (vi.mock factories run before
 *     module-level const initialisers).
 *   - Mount PlayPage at `/play/:gameId?seed=42`, click `start-game` to
 *     enter the playing phase, open the info popover, and assert the
 *     "Seed" row's <code> value is "42".
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
  const TEST_GAME_ID = "info-seed-shown-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Seed Shown Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover seed-display tests.",
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
 * Read the current seed value from the open info popover.
 * The popover renders the seed inside a <code> sibling of the "Seed"
 * label span; we walk popover rows to find the matching label.
 */
function readSeedFromPopover(): string {
  const popover = screen.getByTestId("play-info-popover");
  const labels = popover.querySelectorAll(".play-info-label");
  for (const label of Array.from(labels)) {
    if (label.textContent?.trim() === "Seed") {
      const value = label.nextElementSibling;
      const raw = value?.textContent?.trim() ?? "";
      if (raw !== "") return raw;
    }
  }
  throw new Error("Seed row not found in info popover");
}

describe("PlayPage info popover seed display (W164)", () => {
  it("shows the current seed (from URL ?seed=42) when the info popover opens", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter the playing phase so the full PlayGame UI is mounted; the info
    // button itself lives in the header and is available either way, but
    // matching the broader test fixture flow keeps assertions consistent.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // The URL-supplied seed should be the active seed shown in the popover.
    expect(readSeedFromPopover()).toBe("42");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
