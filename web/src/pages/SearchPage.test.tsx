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
});
