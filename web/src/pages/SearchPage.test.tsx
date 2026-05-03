import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchPage from "./SearchPage.js";

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SearchPage />
    </MemoryRouter>,
  );
}

describe("SearchPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the suggested searches when q is empty", () => {
    renderAt("/search");
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    // Suggested chips render in the empty state.
    expect(screen.getByText("klondike")).toBeInTheDocument();
    expect(screen.getByText("poker")).toBeInTheDocument();
  });

  it("renders results with a top match for a known query", async () => {
    renderAt("/search?q=klondike");
    // Debounce is 200ms — wait for the top match to appear.
    await waitFor(() => {
      expect(screen.getByTestId("search-top-match")).toBeInTheDocument();
    });
  });

  it("persists submitted queries to recent searches in localStorage", async () => {
    renderAt("/search");
    const input = screen.getByTestId("search-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "poker" } });
    await waitFor(() => {
      const raw = localStorage.getItem("cards-recent-searches");
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw ?? "[]") as string[];
      expect(parsed).toContain("poker");
    });
  });

  it("marks the All filter chip active by default when a query is set", async () => {
    renderAt("/search?q=solitaire");
    // Filter row only renders once a query is present — wait for it.
    const allChip = await screen.findByTestId("search-filter-all");
    expect(allChip).toHaveAttribute("aria-pressed", "true");
    // Sibling chips should be inactive.
    expect(screen.getByTestId("search-filter-solitaire")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("search-filter-multiplayer")).toHaveAttribute("aria-pressed", "false");
  });

  it("narrows the games group to solitaire-category hits when Solitaire is clicked", async () => {
    renderAt("/search?q=solitaire");
    // Wait for results to materialise after the 200ms debounce.
    const solitaireChip = await screen.findByTestId("search-filter-solitaire");
    // Click in — connect-4 (board) and uno-like (cards) must NOT appear.
    fireEvent.click(solitaireChip);
    await waitFor(() => {
      expect(solitaireChip).toHaveAttribute("aria-pressed", "true");
    });
    expect(screen.queryByTestId("search-game-connect-4")).not.toBeInTheDocument();
    expect(screen.queryByTestId("search-game-uno-like")).not.toBeInTheDocument();
  });

  it("narrows results to multiplayer-only games when Multiplayer chip is clicked", async () => {
    // Search for "card" — broad enough to surface uno-like (multiplayer)
    // alongside many solitaire hits in the unfiltered set.
    renderAt("/search?q=card");
    const multiChip = await screen.findByTestId("search-filter-multiplayer");
    fireEvent.click(multiChip);
    await waitFor(() => {
      expect(multiChip).toHaveAttribute("aria-pressed", "true");
    });
    // Pure solitaire entries must drop out under the multiplayer filter.
    expect(screen.queryByTestId("search-game-poker-solitaire")).not.toBeInTheDocument();
    expect(screen.queryByTestId("search-game-russian-solitaire")).not.toBeInTheDocument();
  });

  it("restores the filter chip state from a `?q=&filter=` URL round-trip", async () => {
    renderAt("/search?q=card&filter=multiplayer");
    const multiChip = await screen.findByTestId("search-filter-multiplayer");
    expect(multiChip).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("search-filter-all")).toHaveAttribute("aria-pressed", "false");
    // Input should reflect the q param too — confirms the round-trip.
    expect((screen.getByTestId("search-input") as HTMLInputElement).value).toBe("card");
  });
});
