/**
 * Unit test for the PlayPage info popover "Time trend" section label
 * (W1065).
 *
 * Coverage gap: the existing PlayPage.timeTrend.test.tsx (W204) asserts
 * the chart's inner content — the empty-state copy, the SVG path, and
 * the Best/Avg/Plays stats line — but never asserts the section's
 * label text. The popover renders the chart inside a
 * `play-info-popover-section` whose first child is
 * `<span className="play-info-label">Time trend</span>` and whose
 * value sibling is the `TimeTrendChart` (testid `play-time-chart`).
 *
 * Other rows are already covered:
 *   - Seed                 → infoSeedShown
 *   - Started              → infoPopoverStartedRow
 *   - Plays this session   → infoSessionCounter
 *   - Action log           → actionLog
 * Only the Time-trend label/value pairing was unasserted, so this test
 * fills that gap with a single focused expectation.
 *
 * Strategy mirrors PlayPage.infoSeedShown.test.tsx:
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage, open the popover (no need to start playing — the
 *     info button is in the header and renders in every phase), then
 *     locate the "Time trend" label and assert its sibling is the
 *     `play-time-chart` element.
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
  const TEST_GAME_ID = "info-time-trend-label-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Trend Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Time-trend label tests.",
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

describe("PlayPage info popover Time trend label (W1065)", () => {
  it("renders the 'Time trend' label paired with the play-time-chart value inside the popover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Open the popover. The info button lives in the page header and is
    // rendered in every phase, so no Start-playing click is required.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeTruthy();

    // Locate the "Time trend" label among the popover's labels.
    const labels = popover.querySelectorAll(".play-info-label");
    let trendLabel: Element | null = null;
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === "Time trend") {
        trendLabel = label;
        break;
      }
    }
    expect(trendLabel).not.toBeNull();

    // The label's section parent should also enclose the chart value
    // (`play-time-chart`), proving the label/value pairing is wired
    // correctly. Without seeded history the chart renders the empty-state
    // div whose textContent contains the trend prompt.
    const section = trendLabel?.parentElement;
    expect(section?.classList.contains("play-info-popover-section")).toBe(true);
    const chart = section?.querySelector('[data-testid="play-time-chart"]');
    expect(chart).toBeTruthy();
    expect(chart?.textContent).toContain("Play more to see your trend");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
