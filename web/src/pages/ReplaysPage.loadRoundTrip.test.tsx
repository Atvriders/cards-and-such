/**
 * Round-trip test (W705): a saved replay in `cards-replays` can be
 * loaded back from the Replays browser and seeds PlayPage at the same
 * gameId + seed. We seed localStorage with one entry, render
 * ReplaysPage, click the Play button, and assert the router navigated
 * to `/play/<gameId>?seed=<N>`.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ReplaysPage from "./ReplaysPage.js";
import { REPLAYS_KEY, type SavedReplay } from "../platform/replays.js";

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return (
    <div
      data-testid="location-probe"
      data-pathname={loc.pathname}
      data-search={loc.search}
    />
  );
}

describe("ReplaysPage load round-trip (W705)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking Play on a saved replay navigates to PlayPage at the same gameId + seed", () => {
    const entry: SavedReplay = {
      id: "rep-roundtrip",
      gameId: "klondike",
      seed: 424242,
      actions: [],
      savedAt: Date.UTC(2025, 0, 1, 12, 0),
    };
    localStorage.setItem(REPLAYS_KEY, JSON.stringify([entry]));

    render(
      <MemoryRouter initialEntries={["/replays"]}>
        <LocationProbe />
        <Routes>
          <Route path="/replays" element={<ReplaysPage />} />
          <Route path="/play/:gameId" element={<div data-testid="play-stub" />} />
        </Routes>
      </MemoryRouter>,
    );

    // Sanity: we are on /replays before the click.
    const probeBefore = screen.getByTestId("location-probe");
    expect(probeBefore.getAttribute("data-pathname")).toBe("/replays");

    fireEvent.click(screen.getByTestId("replay-play-btn-0"));

    // Router should have navigated to /play/<gameId>?seed=<N>.
    const probeAfter = screen.getByTestId("location-probe");
    expect(probeAfter.getAttribute("data-pathname")).toBe("/play/klondike");
    expect(probeAfter.getAttribute("data-search")).toBe("?seed=424242");
    // And the destination route mounted, confirming the navigation
    // landed where PlayPage would render in production.
    expect(screen.getByTestId("play-stub")).toBeInTheDocument();
  });
});
