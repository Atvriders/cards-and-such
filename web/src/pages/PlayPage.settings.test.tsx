/**
 * Unit tests for PlayPage per-game settings popover (W188).
 *
 * Covers four documented user paths through the popover:
 *   1. Opening the dialog via the `play-settings-btn` toolbar button
 *   2. Rendering a toggle for a `kind: "boolean"` setting
 *   3. Surfacing the "Restart to apply" banner once a setting drifts
 *      from the snapshot taken when the current game started
 *   4. Reset-to-defaults restores the original (default) values, which
 *      also clears the dirty banner since the snapshot is the defaults
 *
 * Strategy:
 *   - `vi.hoisted` builds a single fixture plugin whose `settings` schema
 *     contains one boolean field — the minimum surface needed to exercise
 *     the boolean branch of the popover, the dirty-snapshot diff, and the
 *     reset-to-defaults path.
 *   - The plugin is mocked into `../games/registry.js` so PlayPage resolves
 *     it without pulling in the real registry / lazy imports.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so the vi.mock factory below can reference it. vi.hoisted
// runs before the mocked module's imports are evaluated, so the closure is
// safe even though it visually looks like a TDZ violation.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-popover-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for per-game settings popover tests.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin, settingsSchema };
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

// Helper: mount PlayPage and click through the setup screen so the
// in-game toolbar (with the Settings button) is rendered.
async function mountPlayingPhase(): Promise<void> {
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

describe("PlayPage per-game settings popover (W188)", () => {
  it("opens the popover when play-settings-btn is clicked", async () => {
    await mountPlayingPhase();

    // Modal is closed by default — the dialog isn't in the tree yet.
    expect(screen.queryByTestId("play-settings-modal")).toBeNull();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();
  });

  it("renders a boolean toggle for a kind: \"boolean\" setting", async () => {
    await mountPlayingPhase();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Toggle exists, is a checkbox, and reflects the schema default (false).
    const toggle = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    expect(toggle).toBeTruthy();
    expect(toggle.type).toBe("checkbox");
    expect(toggle.checked).toBe(false);
  });

  it("shows the Restart to apply banner when a setting changes mid-game", async () => {
    await mountPlayingPhase();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Banner is absent until settings drift from the start-of-game snapshot.
    expect(screen.queryByTestId("play-settings-restart-banner")).toBeNull();

    fireEvent.click(screen.getByTestId("play-setting-deluxe"));

    const banner = screen.getByTestId("play-settings-restart-banner");
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("Restart to apply");
  });

  it("Reset to defaults restores original values (clearing dirty state)", async () => {
    await mountPlayingPhase();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Flip the toggle so we have a non-default, dirty state to reset from.
    const toggle = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(screen.getByTestId("play-settings-restart-banner")).toBeTruthy();

    fireEvent.click(screen.getByTestId("play-settings-reset"));

    // The toggle re-reads from state after the reset; query fresh to be safe.
    const toggleAfter = screen.getByTestId("play-setting-deluxe") as HTMLInputElement;
    expect(toggleAfter.checked).toBe(false);
    // Settings now match the snapshot again, so the banner is gone.
    expect(screen.queryByTestId("play-settings-restart-banner")).toBeNull();
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
