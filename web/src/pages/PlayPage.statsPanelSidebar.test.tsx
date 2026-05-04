/**
 * Structural test for the StatsPanel sidebar inside `.play-with-sidebar` (W958).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2565) renders `<StatsPanel … />` as the second
 *   child of the `.play-with-sidebar` wrapper that mounts during the
 *   playing phase. The StatsPanel itself ships a stable
 *   `data-testid="stats-panel"` (see web/src/platform/StatsPanel.tsx
 *   ~line 123), and the responsive desktop two-column / mobile
 *   single-column CSS rules in PlayPage.css depend on the panel being
 *   a descendant of `.play-with-sidebar` rather than rendered as a
 *   detached node elsewhere on the page.
 *
 *   W949's structural test (PlayPage.withSidebarStructural.test.tsx)
 *   pins the wrapper itself and that it contains `.play-panel.play-board`,
 *   but it does not assert the StatsPanel side of the layout. A
 *   refactor that accidentally hoists the StatsPanel out of the
 *   wrapper (e.g. moving it into the toolbar or a separate region)
 *   would silently break the sidebar layout on every viewport with
 *   zero runtime errors and slip past W949. This test fills that gap.
 *
 * Strategy mirrors PlayPage.withSidebarStructural.test.tsx (W949):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the wrapper and StatsPanel only render once
 *     setup is complete).
 *   - Locate the StatsPanel via its `stats-panel` testid.
 *   - Assert it exists and that its closest `.play-with-sidebar`
 *     ancestor matches the wrapper queried directly from the
 *     container — pinning the descendant relationship the CSS
 *     depends on.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "stats-panel-sidebar-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Stats Panel Sidebar Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the stats-panel sidebar structural test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
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

describe("PlayPage StatsPanel sidebar inside .play-with-sidebar (W958)", () => {
  it("mounts the StatsPanel as a descendant of the .play-with-sidebar wrapper during the playing phase", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The sidebar wrapper and StatsPanel only mount in the playing
    // phase, so advance past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const wrapper = container.querySelector(".play-with-sidebar");
    const statsPanel = screen.getByTestId("stats-panel");

    // Pin existence — both the wrapper and the StatsPanel must render
    // for the sidebar layout to exist at all.
    expect(wrapper).not.toBeNull();
    expect(statsPanel).not.toBeNull();

    // Pin the structural invariant the CSS relies on: the StatsPanel
    // is contained inside `.play-with-sidebar`, not rendered as a
    // detached sibling elsewhere on the page.
    expect(wrapper?.contains(statsPanel)).toBe(true);
    expect(statsPanel.closest(".play-with-sidebar")).toBe(wrapper);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
