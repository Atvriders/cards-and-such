/**
 * Count-label test (W737): the `replays-count` tag at the top of the
 * Replays browser pluralizes correctly — "1 saved replay (max 5)" for a
 * single entry and "2 saved replays (max 5)" for multiple. The empty
 * state is covered elsewhere; this fills in the singular vs plural
 * branch of the count tag.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReplaysPage from "./ReplaysPage.js";
import { REPLAYS_KEY, type SavedReplay } from "../platform/replays.js";

function makeReplay(over: Partial<SavedReplay>): SavedReplay {
  return {
    id: over.id ?? "rep-x",
    gameId: over.gameId ?? "klondike",
    seed: over.seed ?? 1,
    actions: over.actions ?? [],
    savedAt: over.savedAt ?? Date.UTC(2024, 0, 1, 12, 0),
  };
}

describe("ReplaysPage count label pluralization (W737)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses singular 'replay' for one entry and plural 'replays' for many", () => {
    // Singular case: one stored replay.
    localStorage.setItem(
      REPLAYS_KEY,
      JSON.stringify([makeReplay({ id: "rep-only" })]),
    );
    const { unmount } = render(
      <MemoryRouter>
        <ReplaysPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("replays-count")).toHaveTextContent(
      "1 saved replay (max 5)",
    );
    unmount();

    // Plural case: two stored replays.
    localStorage.setItem(
      REPLAYS_KEY,
      JSON.stringify([
        makeReplay({ id: "rep-a", seed: 11 }),
        makeReplay({ id: "rep-b", seed: 22 }),
      ]),
    );
    render(
      <MemoryRouter>
        <ReplaysPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("replays-count")).toHaveTextContent(
      "2 saved replays (max 5)",
    );
  });
});
