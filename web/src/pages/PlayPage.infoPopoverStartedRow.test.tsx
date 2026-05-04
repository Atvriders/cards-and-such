/**
 * Unit test for the PlayPage info popover "Started" row (W1047).
 *
 * The info popover mounts a sequence of rows; one labelled "Started" shows
 * `sessionStartRef.current.toLocaleTimeString()` once playing has begun, and
 * an em-dash ("—") fallback before that ref has been seeded.
 *
 * Coverage gap: prior W740/W975/W995/W996/W984/W985/W1005/W1009/W1014 tests
 * cover the popover toggle and dialog wrapper a11y, and W164 (infoSeedShown
 * / infoSessionCounter) covers Seed and Plays this session. The Started row
 * label + timestamp value have not been asserted, so we add a focused test
 * that opens the popover after start-game and verifies the row shows a real
 * time string (not the em-dash placeholder).
 *
 * Strategy mirrors PlayPage.infoSeedShown.test.tsx:
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` so
 *     sessionStartRef.current is populated.
 *   - Open the popover via `play-info-btn` and locate the row whose label
 *     text is "Started"; assert its value sibling renders a non-empty
 *     string distinct from the "—" placeholder.
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
  const TEST_GAME_ID = "info-popover-started-row-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Started Row Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Started-row tests.",
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
 * Locate the "Started" row inside the open info popover and return the
 * trimmed text content of the value sibling next to its label span.
 */
function readStartedValue(): string {
  const popover = screen.getByTestId("play-info-popover");
  const labels = popover.querySelectorAll(".play-info-label");
  for (const label of Array.from(labels)) {
    if (label.textContent?.trim() === "Started") {
      const value = label.nextElementSibling;
      return value?.textContent?.trim() ?? "";
    }
  }
  throw new Error("Started row not found in info popover");
}

describe("PlayPage info popover Started row (W1047)", () => {
  it("renders a real session-start timestamp once playing has begun", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Click Start-playing so sessionStartRef.current is seeded with `new Date()`.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // The Started row should now render the locale time string of the
    // session-start ref, NOT the "—" placeholder used pre-start.
    const startedValue = readStartedValue();
    expect(startedValue).not.toBe("");
    expect(startedValue).not.toBe("—");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
