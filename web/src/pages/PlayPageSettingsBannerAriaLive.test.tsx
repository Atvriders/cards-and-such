/**
 * Unit test for the PlayPage in-game settings modal "Restart to apply"
 * dirty-banner aria-live politeness hook (W1539).
 *
 * The dirty banner is rendered with `aria-live="polite"` alongside its
 * `role="status"` contract (W1531) so that assistive technology announces
 * the warning at the next graceful pause when settings drift mid-game.
 * Although `role="status"` implies a polite live region, JSX rendering
 * pipelines and DOM serialisation paths preserve the explicit attribute
 * separately — and the visible "Restart to apply" copy plus role were
 * already pinned by W1060 / W1531, but the explicit `aria-live` attribute
 * itself was never asserted. A regression that drops it (or flips it to
 * `assertive` / `off`) would silently break the screen-reader cadence we
 * shipped, so we pin the literal value here.
 *
 * This test mirrors W1531: dirty the snapshot with a single boolean
 * toggle, then read `aria-live` directly off the banner node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-banner-aria-live-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Banner Aria-Live Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the dirty-banner aria-live regression.",
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

describe("PlayPage settings dirty banner aria-live (W1539)", () => {
  it("tags the dirty banner with aria-live=polite for non-disruptive announcement", async () => {
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

    // Toggle the only boolean to drift settings from the start-of-game
    // snapshot — this is what mounts the dirty banner.
    fireEvent.click(screen.getByTestId("play-setting-deluxe"));

    const banner = screen.getByTestId("play-settings-restart-banner");
    // aria-live=polite is the contract that controls AT cadence: polite
    // queues the announcement until the user finishes their current
    // utterance, which matches our UX intent. Pin the literal value so a
    // regression that drops it (or swaps to assertive/off) is caught.
    expect(banner.getAttribute("aria-live")).toBe("polite");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
