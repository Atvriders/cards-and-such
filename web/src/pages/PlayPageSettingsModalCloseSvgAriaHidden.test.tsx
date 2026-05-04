/**
 * Unit test for PlayPage settings modal close-button SVG aria-hidden (W1447).
 *
 * The close button inside the settings modal is rendered as a button with
 * a single inline `<svg>` "X" glyph. The button itself carries the
 * accessible name via `aria-label="Close settings"` (covered by
 * settingsModalCloseAriaLabel.test.tsx), so the SVG glyph must be hidden
 * from assistive technology to avoid duplicating / polluting the button's
 * announcement. That contract is encoded as `aria-hidden="true"` on the
 * `<svg>` element.
 *
 * Sibling tests cover:
 *   - dialog className `play-settings-modal`            (W1423)
 *   - close button `type="button"`                      (W1315)
 *   - header element type                               (W1251)
 *   - title text suffix                                 (W1363)
 *   - backdrop `role="presentation"`                    (W1428)
 *   - close button `aria-label`                         (W1059 etc.)
 *
 * None of them assert the inner SVG's `aria-hidden` attribute, so a
 * refactor that swapped the icon for a different SVG without copying the
 * `aria-hidden` prop would silently regress the screen-reader experience
 * without breaking any current test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-close-svg-aria-hidden-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Close SVG Aria-Hidden Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal close SVG aria-hidden.",
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

describe("PlayPage settings modal close button SVG aria-hidden (W1447)", () => {
  it("the close button's inline <svg> glyph carries aria-hidden=\"true\"", async () => {
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
    // Pin the a11y contract: the glyph is hidden from AT so the button's
    // aria-label is the sole accessible name announced.
    expect(svg!.getAttribute("aria-hidden")).toBe("true");
  });
});

void React;
