/**
 * Unit test for the PlayPage info popover "Time trend" section LABEL
 * tagName (W1687).
 *
 * The info popover renders a Time trend section shaped as:
 *   <div class="play-info-popover-section">
 *     <span class="play-info-label">Time trend</span>
 *     <TimeTrendChart history={timeHistory} />
 *   </div>
 *
 * Coverage for adjacent attributes already exists:
 *   - W1065 / W1075: Time trend section structural pairing — finds the
 *     label by `.play-info-label` text-content and asserts the chart
 *     renders alongside it.
 *   - W1485 (PlayPageInfoTimeTrendLabelClass): label className === exactly
 *     "play-info-label" (no extra modifier classes).
 *   - W1673 (PlayPageInfoSeedLabelTag): Seed-row label tagName === "SPAN".
 *   - W1683 (PlayPageInfoStartedLabelTag): Started-row label tagName ===
 *     "SPAN".
 *
 * Uncovered: the Time trend section's LABEL element's tagName itself.
 * Existing tests query the label via `.play-info-label` (which only
 * requires the class to be present) and pin the className value, but
 * never assert that the label is rendered as a `<span>` — the structural
 * choice that keeps the section a flow-level pairing of inline label
 * above the chart. If the label were silently swapped to a block element
 * (e.g. `<div>` or `<label>`), the section's vertical rhythm and a11y
 * semantics would shift without any existing test catching it. This
 * test pins `tagName === "SPAN"` for the Time-trend-section label.
 *
 * Strategy mirrors W1683 (Started-row label tagName test):
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` to enter the
 *     playing phase, click `play-info-btn` (popover opens on click), then
 *     locate the Time-trend label via `.play-info-label` text-content
 *     match and assert its tagName.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-time-trend-label-tag-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Time Trend Label Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for info popover Time-trend-label tagName tests.",
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

describe("PlayPage info popover Time trend section label tagName (W1687)", () => {
  it("renders the Time trend label as a <span> element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase, then open the info popover (click-gated).
    fireEvent.click(screen.getByTestId("start-game"));
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

    // Pin the label's tagName — sibling tests cover className/text but
    // never the inline-element choice itself.
    expect((timeTrendLabel as HTMLElement).tagName).toBe("SPAN");
  });
});

void React;
