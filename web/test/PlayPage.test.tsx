import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../src/App.js";
import { useAuth } from "../src/platform/stores/auth.js";
import { StatsPanel } from "../src/platform/StatsPanel.js";

describe("PlayPage", () => {
  it("renders not-found for unknown game id", () => {
    useAuth.setState({ username: "alice", token: "t.t.t", expiresAt: Date.now() + 1000 * 60 });
    render(
      <MemoryRouter initialEntries={["/play/does-not-exist"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("game-not-found")).toBeInTheDocument();
  });
});

describe("StatsPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders zeros for an unplayed game", () => {
    render(<StatsPanel gameId="klondike" bestTime={null} />);
    expect(screen.getByTestId("stats-panel")).toBeInTheDocument();
    expect(screen.getByTestId("stats-played")).toHaveTextContent("0");
    expect(screen.getByTestId("stats-best")).toHaveTextContent("0");
    expect(screen.getByTestId("stats-win-rate")).toHaveTextContent("–");
    expect(screen.queryByTestId("stats-best-time")).toBeNull();
    expect(screen.queryByTestId("stats-rating")).toBeNull();
  });

  it("reads stats, best time, and rating from localStorage", () => {
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        totalPlayed: 4,
        totalWins: 3,
        longestStreak: 0,
        currentStreak: 0,
        perGame: { klondike: { played: 4, wins: 3, best: 720 } },
        perCategory: {},
        daysPlayed: [],
        unlocked: [],
      }),
    );
    localStorage.setItem("cards-ratings", JSON.stringify({ klondike: 4 }));
    render(<StatsPanel gameId="klondike" bestTime={123} />);
    expect(screen.getByTestId("stats-played")).toHaveTextContent("4");
    expect(screen.getByTestId("stats-best")).toHaveTextContent("720");
    expect(screen.getByTestId("stats-win-rate")).toHaveTextContent("75%");
    expect(screen.getByTestId("stats-best-time")).toHaveTextContent("02:03");
    expect(screen.getByTestId("stats-rating")).toHaveTextContent("★★★★☆");
  });

  it("collapses and expands via toggle", () => {
    render(<StatsPanel gameId="klondike" bestTime={null} />);
    expect(screen.getByTestId("stats-played")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("stats-panel-toggle"));
    expect(screen.queryByTestId("stats-played")).toBeNull();
    fireEvent.click(screen.getByTestId("stats-panel-toggle"));
    expect(screen.getByTestId("stats-played")).toBeInTheDocument();
  });

  it("requires confirmation before resetting and clears stored values", () => {
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        totalPlayed: 2,
        totalWins: 1,
        longestStreak: 0,
        currentStreak: 0,
        perGame: { klondike: { played: 2, wins: 1, best: 50 } },
        perCategory: {},
        daysPlayed: [],
        unlocked: [],
      }),
    );
    localStorage.setItem("cards-best-times", JSON.stringify({ klondike: 99 }));
    localStorage.setItem("cards-ratings", JSON.stringify({ klondike: 5 }));

    render(<StatsPanel gameId="klondike" bestTime={99} />);
    expect(screen.getByTestId("stats-played")).toHaveTextContent("2");

    // First click arms the confirmation
    fireEvent.click(screen.getByTestId("stats-panel-reset"));
    expect(screen.getByTestId("stats-panel-reset")).toHaveTextContent(/confirm/i);
    expect(screen.getByTestId("stats-panel-cancel")).toBeInTheDocument();

    // Cancel returns to default state without clearing
    fireEvent.click(screen.getByTestId("stats-panel-cancel"));
    expect(screen.getByTestId("stats-panel-reset")).toHaveTextContent("Reset stats");
    expect(JSON.parse(localStorage.getItem("cards-ratings") ?? "{}").klondike).toBe(5);

    // Confirm clears stored values
    fireEvent.click(screen.getByTestId("stats-panel-reset"));
    fireEvent.click(screen.getByTestId("stats-panel-reset"));
    expect(screen.getByTestId("stats-played")).toHaveTextContent("0");
    expect(JSON.parse(localStorage.getItem("cards-ratings") ?? "{}").klondike).toBeUndefined();
    expect(JSON.parse(localStorage.getItem("cards-best-times") ?? "{}").klondike).toBeUndefined();
    const stats = JSON.parse(localStorage.getItem("cards-and-such:stats:v1") ?? "{}");
    expect(stats.perGame.klondike).toBeUndefined();
  });
});
