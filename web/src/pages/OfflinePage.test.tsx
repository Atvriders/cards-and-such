import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OfflinePage from "./OfflinePage.js";
import { GAMES } from "../games/registry.js";

function renderPage(): void {
  render(
    <MemoryRouter>
      <OfflinePage />
    </MemoryRouter>,
  );
}

function pickGameIds(n: number): string[] {
  return GAMES.filter((g): g is NonNullable<typeof g> => g != null)
    .slice(0, n)
    .map((g) => g.id);
}

describe("OfflinePage", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Navigator.prototype,
    "onLine",
  );

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(Navigator.prototype, "onLine", originalDescriptor);
    }
  });

  it("renders without crashing", () => {
    renderPage();
    expect(screen.getByTestId("offline-page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /you're offline/i }),
    ).toBeInTheDocument();
  });

  it("status pill reflects navigator.onLine", () => {
    Object.defineProperty(Navigator.prototype, "onLine", {
      configurable: true,
      get: () => false,
    });
    const { unmount } = render(
      <MemoryRouter>
        <OfflinePage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
    expect(
      document.querySelector(".offline-dot.is-offline"),
    ).not.toBeNull();
    unmount();

    Object.defineProperty(Navigator.prototype, "onLine", {
      configurable: true,
      get: () => true,
    });
    renderPage();
    expect(screen.getByText(/network restored/i)).toBeInTheDocument();
    expect(document.querySelector(".offline-dot.is-online")).not.toBeNull();
  });

  it("renders recently-played list from cards-recent-games", () => {
    const ids = pickGameIds(3);
    expect(ids.length).toBeGreaterThan(0);
    localStorage.setItem("cards-recent-games", JSON.stringify(ids));

    renderPage();
    for (const id of ids) {
      const link = screen.getByTestId(`offline-recent-${id}`);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", `/play/${id}`);
    }
    expect(
      screen.queryByText(/no recent games yet/i),
    ).not.toBeInTheDocument();
  });

  it("renders Most-played offline section from loadStats().perGame", () => {
    const ids = pickGameIds(2);
    expect(ids.length).toBeGreaterThan(0);
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    ids.forEach((id, i) => {
      perGame[id] = { played: 10 - i, wins: 1, best: 0 };
    });
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({
        totalPlayed: 0,
        totalWins: 0,
        longestStreak: 0,
        currentStreak: 0,
        perGame,
        perCategory: {},
        daysPlayed: [],
        unlocked: [],
      }),
    );

    renderPage();
    expect(
      screen.getByTestId("offline-most-played-section"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /most-played offline/i }),
    ).toBeInTheDocument();
    for (const id of ids) {
      const link = screen.getByTestId(`offline-most-played-${id}`);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", `/play/${id}`);
    }
  });
});
