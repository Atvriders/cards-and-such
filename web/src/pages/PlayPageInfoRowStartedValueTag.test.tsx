/**
 * Unit test for the PlayPage info popover "Started" row value tag (W1382).
 *
 * The info popover renders rows with a `<span class="play-info-label">` label
 * paired with a value sibling. Coverage for adjacent attributes already
 * exists:
 *   - W1330: action-log summary class
 *   - W1355: seed value `<code>` tag
 *   - W1249: close className
 *   - W1268: how-to-play link className
 *   - W1047: Started row value text (timestamp content)
 *
 * Uncovered: the Started row's value sibling element is a `<span>` (NOT a
 * `<code>` like the Seed row), AND that the Started row sits inside a
 * `.play-info-popover-row` wrapper. This test pins both — the value
 * sibling tagName === "SPAN" and the wrapping row className.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-started-value-tag-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Started Value Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Started value tag tests.",
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

describe("PlayPage info popover Started row value tag (W1382)", () => {
  it("renders Started value as a <span> inside .play-info-popover-row", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Click Start-playing so the Started row is rendered when popover opens.
    fireEvent.click(screen.getByTestId("start-game"));
    // Open the info popover (must click info-btn first).
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

    // Value sibling is a <span> — distinct from Seed's <code>.
    const valueSibling = startedLabel?.nextElementSibling;
    expect(valueSibling).not.toBeNull();
    expect(valueSibling?.tagName).toBe("SPAN");

    // Wrapping row carries the .play-info-popover-row class.
    const row = startedLabel?.closest(".play-info-popover-row");
    expect(row).not.toBeNull();
    expect(row?.classList.contains("play-info-popover-row")).toBe(true);
  });
});

void React;
