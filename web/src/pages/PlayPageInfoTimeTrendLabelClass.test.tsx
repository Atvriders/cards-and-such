/**
 * Unit test for the PlayPage info popover "Time trend" section LABEL
 * className (W1485).
 *
 * The info popover renders a Time trend section shaped as:
 *   <div class="play-info-popover-section">
 *     <span class="play-info-label">Time trend</span>
 *     <TimeTrendChart history={timeHistory} />
 *   </div>
 *
 * Coverage for adjacent attributes already exists:
 *   - W1065: Time trend label paired with chart value
 *   - W1075: Time trend row section structure + label text
 *   - W1463: Started row LABEL className (exact)
 *   - W1469: Seed row LABEL className (exact)
 *
 * Uncovered: the Time trend section's LABEL element's className value
 * itself. Existing tests query the label via `.play-info-label` (which
 * only requires the class to be present somewhere) but never pin that
 * the Time trend label's `className` is EXACTLY `"play-info-label"` —
 * i.e. no extra modifier classes were silently appended. This test
 * fills that gap by mirroring W1463/W1469 for the Time trend section.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-time-trend-label-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Time Trend Label Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for info popover Time-trend-label className tests.",
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

describe("PlayPage info popover Time trend section label className (W1485)", () => {
  it("renders the Time trend label with className exactly 'play-info-label'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Click Start-playing so the popover sections render once opened.
    fireEvent.click(screen.getByTestId("start-game"));
    // Open the info popover (info-btn click first, per popover gating).
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    const labels = popover.querySelectorAll(".play-info-label");
    let timeTrendLabel: Element | null = null;
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === "Time trend") {
        timeTrendLabel = label;
        break;
      }
    }
    expect(timeTrendLabel).not.toBeNull();

    // Pin the className to exactly the single declared class — no extras.
    expect((timeTrendLabel as HTMLElement).className).toBe("play-info-label");
  });
});

void React;
