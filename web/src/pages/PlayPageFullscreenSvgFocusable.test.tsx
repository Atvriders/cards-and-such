/**
 * Unit test for the PlayPage fullscreen button's inner <svg> focusable attr (W1264).
 *
 * Observable behavior:
 *   When the page is in `phase === "playing"`, the toolbar's fullscreen
 *   button (`play-fullscreen-btn`, PlayPage.tsx ~line 2187) wraps a
 *   decorative `<svg>` icon. That inner svg is rendered with
 *   `focusable="false"` so legacy IE/Edge engines (and any tab-walker that
 *   honors the attribute on SVG roots) do not let keyboard users tab onto
 *   the icon itself instead of the surrounding `<button>`. Sibling tests
 *   cover the button's `title`, `data-tooltip`, `aria-keyshortcuts`
 *   (absence) and the click-tracking behavior, but none assert the inner
 *   svg's `focusable` attribute — a refactor that drops it would silently
 *   reintroduce a duplicate tab stop without breaking other assertions.
 *
 * Strategy:
 *   - Hoisted minimal fixture plugin so the page renders without dragging
 *     the real game catalogue in (mirrors sibling fullscreen tests).
 *   - Click `start-game` to advance into `phase === "playing"`, the only
 *     phase that mounts the fullscreen toolbar button.
 *   - Locate the descendant `<svg>` of the fullscreen button and read its
 *     `focusable` attribute directly via `getAttribute`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "fullscreen-svg-focusable-fixture";
  type State = Record<string, never>;
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Fullscreen SVG Focusable Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the play-fullscreen-btn inner-svg focusable attribute test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({}),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-body" />,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

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

describe("PlayPage fullscreen button inner svg focusable (W1264)", () => {
  it("play-fullscreen-btn's inner <svg> exposes focusable='false' while phase === 'playing'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));

    const fsBtn = screen.getByTestId("play-fullscreen-btn");
    const svg = fsBtn.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("focusable")).toBe("false");
  });
});

void React;
