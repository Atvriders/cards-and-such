import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReplaysPage from "./ReplaysPage.js";
import { REPLAYS_KEY, type SavedReplay } from "../platform/replays.js";

function renderPage(): void {
  render(
    <MemoryRouter>
      <ReplaysPage />
    </MemoryRouter>,
  );
}

function seedReplay(over: Partial<SavedReplay> = {}): SavedReplay {
  return {
    id: over.id ?? "rep-1",
    gameId: over.gameId ?? "klondike",
    seed: over.seed ?? 12345,
    actions: over.actions ?? [],
    savedAt: over.savedAt ?? Date.UTC(2024, 0, 1, 12, 0),
  };
}

describe("ReplaysPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the empty state when no replays are saved", () => {
    renderPage();
    expect(screen.getByTestId("replays-page")).toBeInTheDocument();
    expect(screen.getByTestId("replays-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("replay-row-0")).not.toBeInTheDocument();
  });

  it("renders one row per entry from cards-replays localStorage", () => {
    const stored: SavedReplay[] = [
      seedReplay({ id: "rep-a", gameId: "klondike", seed: 11 }),
      seedReplay({ id: "rep-b", gameId: "freecell", seed: 22 }),
    ];
    localStorage.setItem(REPLAYS_KEY, JSON.stringify(stored));
    renderPage();
    expect(screen.getByTestId("replay-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("replay-row-1")).toBeInTheDocument();
    expect(screen.queryByTestId("replay-row-2")).not.toBeInTheDocument();
  });

  it("builds the Play link href with the gameId and seed", () => {
    localStorage.setItem(
      REPLAYS_KEY,
      JSON.stringify([seedReplay({ gameId: "klondike", seed: 12345 })]),
    );
    renderPage();
    expect(screen.getByTestId("replay-play-btn-0")).toHaveAttribute(
      "href",
      "/play/klondike?seed=12345",
    );
  });

  it("removes the entry from cards-replays localStorage when Delete is clicked", () => {
    localStorage.setItem(
      REPLAYS_KEY,
      JSON.stringify([seedReplay({ id: "rep-1" })]),
    );
    renderPage();
    fireEvent.click(screen.getByTestId("replay-delete-btn-0"));
    expect(screen.queryByTestId("replay-row-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("replays-empty")).toBeInTheDocument();
    const raw = localStorage.getItem(REPLAYS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual([]);
  });
});
