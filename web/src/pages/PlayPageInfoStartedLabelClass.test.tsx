/**
 * Unit test for the PlayPage info popover "Started" row LABEL className
 * (W1463).
 *
 * The info popover renders rows shaped as:
 *   <div class="play-info-popover-row">
 *     <span class="play-info-label">Started</span>
 *     <span>{timestamp}</span>
 *   </div>
 *
 * Coverage for adjacent attributes already exists:
 *   - W1330: action-log summary class
 *   - W1355: seed value <code> tag
 *   - W1382: Started row VALUE tag (the <span> sibling)
 *   - W1379: action-log empty copy
 *   - W1419: info-popover tabindex
 *
 * Uncovered: the Started row's LABEL element's className value itself.
 * Existing tests query labels via `.play-info-label` (which only requires
 * the class to be present somewhere) but never pin that the Started
 * label's `className` is EXACTLY `"play-info-label"` — i.e. no extra
 * modifier classes were silently appended. This test fills that gap.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-started-label-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Started Label Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Started-label className tests.",
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

describe("PlayPage info popover Started row label className (W1463)", () => {
  it("renders the Started label with className exactly 'play-info-label'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Click Start-playing so the Started row renders once the popover opens.
    fireEvent.click(screen.getByTestId("start-game"));
    // Open the info popover (info-btn click first, per popover gating).
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    const labels = popover.querySelectorAll(".play-info-label");
    let startedLabel: Element | null = null;
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === "Started") {
        startedLabel = label;
        break;
      }
    }
    expect(startedLabel).not.toBeNull();

    // Pin the className to exactly the single declared class — no extras.
    expect((startedLabel as HTMLElement).className).toBe("play-info-label");
  });
});

void React;
