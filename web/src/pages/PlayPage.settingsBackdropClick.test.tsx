/**
 * Unit test for PlayPage settings modal backdrop click-to-dismiss (W1013).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2241) renders a `play-settings-backdrop` scrim with
 *   an `onClick={() => setSettingsModalOpen(false)}` handler whenever
 *   `settingsModalOpen` is true. Clicking the scrim flips the state to
 *   false, which unmounts both the backdrop and its `play-settings-modal`
 *   child (the modal's own onClick stops propagation so an in-modal click
 *   does NOT dismiss). The settings-Esc test (W730) pins keyboard dismissal
 *   and the close-button tests pin chrome-driven dismissal, but no existing
 *   test pins the click-outside-the-modal pointer dismissal — a regression
 *   that dropped the backdrop's onClick wiring (or moved it onto the modal
 *   itself) would silently break click-anywhere-outside-the-card UX while
 *   every other settings test stayed green.
 *
 * Strategy:
 *   Mount the PlayPage with a hoisted fixture plugin that ships a tiny
 *   boolean settings schema (mirroring W730), advance past setup so the
 *   toolbar's settings button is mounted, click the trigger to open the
 *   modal, then `fireEvent.click` the `play-settings-backdrop` scrim. The
 *   contract pin: both `play-settings-backdrop` and `play-settings-modal`
 *   unmount.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-backdrop-click-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Backdrop Click Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings backdrop click-to-dismiss test.",
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
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings modal: clicking the backdrop dismisses the modal (W1013)", () => {
  it("unmounts both backdrop and modal when the scrim is clicked", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", toolbar mounts the settings btn.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the per-game settings modal via the toolbar trigger.
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    // Sanity: modal + backdrop both mounted before the dismiss click.
    const backdrop = screen.getByTestId("play-settings-backdrop");
    expect(backdrop).toBeTruthy();
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();

    // Click the backdrop — that's where PlayPage attaches the
    // setSettingsModalOpen(false) onClick handler. The inner modal stops
    // propagation, so this click only fires on the scrim itself.
    fireEvent.click(backdrop);

    // The contract pin: settingsModalOpen flipped to false, so both the
    // backdrop scrim and the modal it gates unmount together.
    expect(screen.queryByTestId("play-settings-backdrop")).toBeNull();
    expect(screen.queryByTestId("play-settings-modal")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
