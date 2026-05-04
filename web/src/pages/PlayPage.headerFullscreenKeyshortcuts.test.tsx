/**
 * Unit test for the PlayPage header fullscreen button's lack of an
 * `aria-keyshortcuts` attribute (W973).
 *
 * Observable behavior:
 *   When the page is in `phase === "playing"`, the toolbar's fullscreen
 *   button (`play-fullscreen-btn`, PlayPage.tsx ~line 2187) is rendered
 *   without an `aria-keyshortcuts` attribute. Fullscreen on this page is
 *   driven only by the click handler — there is no global keyboard
 *   shortcut bound to it — so advertising one to assistive technology
 *   would be misleading. A refactor that mistakenly adds
 *   `aria-keyshortcuts` (e.g., `"F"` or `"Control+Shift+F"`) would
 *   promise users a key combination the page does not actually honor.
 *
 * Strategy:
 *   - Hoisted minimal fixture plugin so the page renders without dragging
 *     the real game catalogue into the test, mirroring the sibling
 *     `PlayPage.headerFullscreenTooltip.test.tsx`.
 *   - Click `start-game` to advance into `phase === "playing"`, the only
 *     phase that mounts the fullscreen toolbar button.
 *   - Assert directly on the absence of the `aria-keyshortcuts`
 *     attribute via `hasAttribute`.
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
  const TEST_GAME_ID = "header-fullscreen-keyshortcuts-fixture";
  type State = Record<string, never>;
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Fullscreen Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the play-fullscreen-btn aria-keyshortcuts test.",
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

describe("PlayPage header fullscreen keyshortcuts (W973)", () => {
  it("play-fullscreen-btn does NOT expose aria-keyshortcuts while phase === 'playing'", async () => {
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
    expect(fsBtn.hasAttribute("aria-keyshortcuts")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
