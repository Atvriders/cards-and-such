/**
 * Unit test for the PlayPage info popover "Time trend" row (W1075).
 *
 * The info popover mounts a sequence of rows + sections; one section uses
 * the `.play-info-popover-section` class with a "Time trend" label and a
 * <TimeTrendChart history={timeHistory} /> child. Existing W164 / W1047
 * tests cover Seed and Started rows; W571/W204 (timeTrend.test.tsx)
 * exercises the chart's empty/seeded copy but never asserts that the
 * "Time trend" label itself is rendered as the section's label and that
 * the chart child sits next to it.
 *
 * Strategy mirrors PlayPage.infoPopoverStartedRow.test.tsx:
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` so the popover
 *     button becomes available.
 *   - Open the popover via `play-info-btn` and locate the section whose
 *     label text is "Time trend"; assert it exists and that its parent
 *     section also contains the SVG/empty-state chart node so the row
 *     wires label -> value correctly.
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
  const TEST_GAME_ID = "info-popover-time-trend-row-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Time Trend Row Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Time-trend section tests.",
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
 * Locate the "Time trend" section inside the open info popover and return
 * the section element so the caller can assert both the label and the
 * chart child mounted alongside it.
 */
function findTimeTrendSection(): Element {
  const popover = screen.getByTestId("play-info-popover");
  const labels = popover.querySelectorAll(".play-info-label");
  for (const label of Array.from(labels)) {
    if (label.textContent?.trim() === "Time trend") {
      const section = label.closest(".play-info-popover-section");
      if (section) return section;
    }
  }
  throw new Error("Time trend section not found in info popover");
}

describe("PlayPage info popover Time trend row (W1075)", () => {
  it("renders the 'Time trend' label and the trend chart inside the popover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the info button is available and the popover
    // renders its full row set (Seed / Started / Plays / Time trend / ...).
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Section exists and carries the "Time trend" label.
    const section = findTimeTrendSection();
    const label = section.querySelector(".play-info-label");
    expect(label?.textContent?.trim()).toBe("Time trend");

    // The chart child must mount alongside the label. With no seeded
    // history, TimeTrendChart renders the empty-state copy; either way,
    // the section should contain content beyond the label itself.
    const sectionText = section.textContent ?? "";
    const labelText = label?.textContent ?? "";
    expect(sectionText.length).toBeGreaterThan(labelText.length);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
