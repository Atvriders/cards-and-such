/**
 * Unit test for PlayPage settings modal close-button SVG viewBox (W1455).
 *
 * The close button inside the settings modal renders an inline `<svg>` "X"
 * glyph sized via width/height="14" but drawn against a 24×24 coordinate
 * system. The line endpoints (e.g. x1=18, y1=6) only make geometric sense
 * when interpreted under the `viewBox="0 0 24 24"` contract. Drop or
 * mistype the viewBox and the glyph collapses or stretches into a non-X
 * shape, even though every other attribute survives — none of the sibling
 * close-SVG tests pin the viewBox.
 *
 * Sibling tests cover:
 *   - close button `type="button"`        (W1315)
 *   - close <svg> `aria-hidden="true"`    (W1447)
 *   - close button `aria-label`           (settingsModalCloseAriaLabel)
 *
 * None of them assert the SVG's `viewBox`, so a refactor that swapped the
 * coordinate system (or removed it entirely) would silently break the
 * rendered glyph without failing any existing test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-close-svg-viewbox-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Close SVG ViewBox Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal close SVG viewBox.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings modal close button SVG viewBox (W1455)", () => {
  it("the close button's inline <svg> glyph declares viewBox=\"0 0 24 24\"", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const closeBtn = screen.getByTestId("play-settings-close");
    const svg = closeBtn.querySelector("svg");
    expect(svg).toBeTruthy();
    // Pin the coordinate system: the X-glyph line endpoints (6/18) are
    // drawn against a 24×24 box. Changing the viewBox silently mangles
    // the glyph despite width/height staying at 14.
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
  });
});

void React;
