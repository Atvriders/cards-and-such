/**
 * W1010 — PlayPage settings modal dismisses on outside (backdrop) click.
 *
 * Analog of W1002 (seed-pick popover outside-click dismissal). The settings
 * modal renders an outer `.play-settings-backdrop` wrapper whose `onClick`
 * handler clears `settingsModalOpen`. The inner `.play-settings-modal`
 * stops propagation, so clicking *outside* the dialog (i.e. on the backdrop
 * itself) is the only path that triggers this dismissal — equivalent to a
 * click-outside in the seed-picker pattern.
 *
 * The info popover only listens for Escape, not outside-click, so the
 * settings modal is the right surface for this analog.
 *
 * Strategy mirrors `PlayPage.settingsEsc.test.tsx`:
 *   - vi.hoisted fixture plugin with a single boolean setting so the modal
 *     renders real form rows (not the "no settings" empty state).
 *   - Plugin is mocked into `../games/registry.js` so PlayPage resolves it
 *     without dragging in real plugins.
 *   - We click `start-game`, open the settings modal, then click the
 *     backdrop. The dialog should unmount.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-outside-click-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Outside-Click Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal outside-click test.",
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings modal outside-click (W1010)", () => {
  it("dismisses the settings modal when the backdrop is clicked outside the dialog", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup so the toolbar mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the settings modal via its toolbar trigger.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();

    // Click the backdrop — the area outside the inner dialog. The inner
    // `.play-settings-modal` calls e.stopPropagation(), so a click directly
    // on the backdrop is the only path that triggers outside-click dismiss.
    fireEvent.click(screen.getByTestId("play-settings-backdrop"));

    // Modal should have unmounted.
    expect(screen.queryByTestId("play-settings-modal")).toBeNull();
  });
});

void React;
