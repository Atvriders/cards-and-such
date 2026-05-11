import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StatsPanel } from "./StatsPanel.js";

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

afterEach(() => {
  cleanup();
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

describe("StatsPanel", () => {
  it("renders the panel header, default stat labels, and zero-state values", () => {
    render(<StatsPanel gameId="nonexistent-game" bestTime={null} />);

    const panel = screen.getByTestId("stats-panel");
    expect(panel).not.toBeNull();
    expect(panel.getAttribute("aria-label")).toBe("Your stats for this game");

    expect(screen.getByText("Your stats")).not.toBeNull();
    expect(screen.getByText("Times played")).not.toBeNull();
    expect(screen.getByText("Best score")).not.toBeNull();
    expect(screen.getByText("Win rate")).not.toBeNull();

    expect(screen.getByTestId("stats-played").textContent).toBe("0");
    expect(screen.getByTestId("stats-best").textContent).toBe("0");
    // En-dash placeholder when there are no plays yet.
    expect(screen.getByTestId("stats-win-rate").textContent).toBe("–");

    // No bestTime prop -> no best-time row.
    expect(screen.queryByTestId("stats-best-time")).toBeNull();
    // No rating stored -> no rating row.
    expect(screen.queryByTestId("stats-rating")).toBeNull();

    // Default reset button label (not in confirming state).
    const reset = screen.getByTestId("stats-panel-reset");
    expect(reset.textContent).toBe("Reset stats");
  });

  it("renders the formatted best-time row when a bestTime prop is provided", () => {
    render(<StatsPanel gameId="game-with-time" bestTime={75} />);

    const bestTimeCell = screen.getByTestId("stats-best-time");
    // 75 seconds -> 01:15
    expect(bestTimeCell.textContent).toBe("01:15");
    expect(screen.getByText("Best time")).not.toBeNull();
  });

  it("renders played count, best score, win rate, and rating stars from localStorage", () => {
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        perGame: {
          "test-game": { played: 4, wins: 3, best: 1200 },
        },
      }),
    );
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "test-game": 4 }),
    );

    render(<StatsPanel gameId="test-game" bestTime={null} />);

    expect(screen.getByTestId("stats-played").textContent).toBe("4");
    expect(screen.getByTestId("stats-best").textContent).toBe("1200");
    // 3 / 4 = 75%
    expect(screen.getByTestId("stats-win-rate").textContent).toBe("75%");

    const rating = screen.getByTestId("stats-rating");
    // 4 filled stars + 1 empty star
    expect(rating.textContent).toBe("★★★★☆");
  });
});
