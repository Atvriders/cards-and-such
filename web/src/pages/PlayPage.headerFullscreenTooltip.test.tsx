/**
 * Unit test for the PlayPage header fullscreen button's tooltip attribute (W966).
 *
 * Observable behavior:
 *   When the page is in `phase === "playing"`, the toolbar's fullscreen button
 *   (`play-fullscreen-btn`, PlayPage.tsx ~line 2187) renders with a
 *   `data-tooltip="Fullscreen"` attribute that the shared CSS tooltip layer
 *   reads to render a hover label. Sibling tests cover the analytics
 *   breadcrumb and exit-tracking behavior of this same button, but none
 *   verify the tooltip attribute itself — a refactor that drops or renames
 *   `data-tooltip` would silently regress the hover affordance without
 *   breaking any existing assertions.
 *
 * Strategy:
 *   - Hoisted minimal fixture plugin so the page renders without dragging
 *     the real game catalogue into the test, mirroring the sibling
 *     `PlayPage.fullscreenTrack.test.tsx`.
 *   - Click `start-game` to advance into `phase === "playing"`, the only
 *     phase that mounts the fullscreen toolbar button.
 *   - Read the `data-tooltip` attribute directly off the rendered element
 *     and compare it to the literal `"Fullscreen"` value the source sets.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. Minimal non-terminal reducer so the page sits in
// `phase === "playing"` after `start-game`, which is the only phase that
// renders the fullscreen toolbar button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-fullscreen-tooltip-fixture";
  type State = Record<string, never>;
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Fullscreen Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-fullscreen-btn tooltip test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({}),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-body" />,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header fullscreen tooltip (W966)", () => {
  it("play-fullscreen-btn exposes data-tooltip='Fullscreen' while phase === 'playing'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup screen so phase === "playing" and the
    // fullscreen toolbar button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const fsBtn = screen.getByTestId("play-fullscreen-btn");
    expect(fsBtn.getAttribute("data-tooltip")).toBe("Fullscreen");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
