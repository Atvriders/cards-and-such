/**
 * Unit test for PlayPage settings modal fields container (W1083).
 *
 * The settings modal renders configurable fields inside a container div
 * with `className="play-settings-fields"`. Sibling tests (W988/W997 and
 * the various settingsModal*.test.tsx files) cover the dialog wrapper,
 * aria-label, focus and keyboard behaviour, plus per-field render tests
 * (settingsBooleanLabel / settingsEnumField / settingsNumberField). The
 * structural class on the *container* div that groups those fields has
 * never been asserted, so a refactor that drops or renames the class
 * (e.g. to `play-settings-body`) would silently break CSS that targets
 * it without breaking any current test.
 *
 * Strategy mirrors PlayPage.settingsModalAriaLabel.test.tsx:
 *   - vi.hoisted fixture plugin with at least one settings field so the
 *     fields branch (not the empty-state `<p>`) renders.
 *   - Mount PlayPage at /play/:gameId, click `start-game`, then open the
 *     settings modal via `play-settings-btn`.
 *   - Assert exactly one `.play-settings-fields` element exists inside
 *     the open modal.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-fields-structural-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Fields Structural Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings fields container class test.",
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

describe("PlayPage settings modal fields container (W1083)", () => {
  it("renders exactly one `.play-settings-fields` div inside the open modal", async () => {
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

    const modal = screen.getByTestId("play-settings-modal");
    const fieldsContainers = modal.querySelectorAll(".play-settings-fields");
    expect(fieldsContainers.length).toBe(1);
    // The container is the structural wrapper for setting rows; verify it
    // is a div so the structural contract (block-level grouping element)
    // is also pinned, not just the class string.
    expect(fieldsContainers[0].tagName).toBe("DIV");
  });
});

void React;
