/**
 * Unit test for PlayPage settings modal close-button SVG `focusable`
 * attribute (W1487).
 *
 * Sibling tests pin the close button's `type="button"` (W1315), its
 * `aria-label` (W1003), the inner SVG's `aria-hidden="true"` (W1447)
 * and the SVG's `viewBox` (W1455), but none of them assert that the
 * decorative SVG explicitly opts out of being a focus target via
 * `focusable="false"`.
 *
 * Why this matters: legacy IE/Edge — and some assistive-tech focus
 * recalculations in modern browsers — treat inline `<svg>` elements as
 * focusable by default, inserting them into the tab order. That means
 * Tab/Shift+Tab inside the modal's focus trap would land on the empty
 * X glyph before reaching the actual close `<button>`, surprising
 * keyboard users and disrupting the trap's contract. The component
 * already sets `focusable="false"` on this glyph; this test locks that
 * attribute in so a refactor can't silently drop it and reintroduce
 * the rogue stop.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-close-svg-focusable-fixture";
  const TEST_TITLE = "Settings Modal Close Svg Focusable Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for settings modal close-button SVG focusable attribute test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin, settingsSchema };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

async function mountPlaying(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId("start-game"));
}

describe("PlayPage settings modal close-button SVG focusable attribute (W1487)", () => {
  it("the close glyph SVG has focusable='false' to stay out of the tab order", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const closeBtn = screen.getByTestId("play-settings-close");
    const svg = closeBtn.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute("focusable")).toBe("false");
  });
});

void React;
