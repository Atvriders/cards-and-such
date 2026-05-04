/**
 * Delete-one test (W733): when there are multiple saved replays, clicking
 * Delete on one row removes ONLY that entry — both from the DOM and from
 * the `cards-replays` localStorage array — leaving the other entries
 * intact. Complements the existing single-entry delete test which only
 * verifies the empty-state transition.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReplaysPage from "./ReplaysPage.js";
import { REPLAYS_KEY, type SavedReplay } from "../platform/replays.js";

describe("ReplaysPage delete one of many (W733)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes only the clicked entry and leaves the other in DOM and storage", () => {
    // On-disk order is oldest-first; ReplaysPage reverses for render so
    // rep-keep (savedAt later) renders at row-0 and rep-drop at row-1.
    const stored: SavedReplay[] = [
      {
        id: "rep-drop",
        gameId: "klondike",
        seed: 11,
        actions: [],
        savedAt: Date.UTC(2024, 0, 1, 12, 0),
      },
      {
        id: "rep-keep",
        gameId: "freecell",
        seed: 22,
        actions: [],
        savedAt: Date.UTC(2024, 0, 2, 12, 0),
      },
    ];
    localStorage.setItem(REPLAYS_KEY, JSON.stringify(stored));

    render(
      <MemoryRouter>
        <ReplaysPage />
      </MemoryRouter>,
    );

    // Sanity: both rows present before delete.
    expect(screen.getByTestId("replay-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("replay-row-1")).toBeInTheDocument();

    // Row 1 is the older entry (rep-drop, seed 11) after the reverse.
    fireEvent.click(screen.getByTestId("replay-delete-btn-1"));

    // Exactly one row remains, and it is the keeper.
    expect(screen.getByTestId("replay-row-0")).toBeInTheDocument();
    expect(screen.queryByTestId("replay-row-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("replays-empty")).not.toBeInTheDocument();
    // The Play link on the surviving row points at the keeper's seed.
    expect(screen.getByTestId("replay-play-btn-0")).toHaveAttribute(
      "href",
      "/play/freecell?seed=22",
    );

    // Storage shrank from 2 to 1, and the surviving entry is rep-keep.
    const raw = localStorage.getItem(REPLAYS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as SavedReplay[];
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.id).toBe("rep-keep");
    expect(parsed.some((r) => r.id === "rep-drop")).toBe(false);
  });
});
