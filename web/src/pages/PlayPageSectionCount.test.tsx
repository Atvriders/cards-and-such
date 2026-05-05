/**
 * Pinpoint test for the PlayPage `<section>` element count in the default
 * playing phase (W1968).
 *
 * Observable behavior:
 *   PlayPage.tsx renders three distinct `<section>` elements across the
 *   page lifecycle, but only one is mounted at any given time:
 *     • setup-panel (~line 2411) — only while phase === "setup"
 *     • play-panel  (~line 2522) — only while phase === "playing"
 *     • end-panel   (~line 2654) — only once phase === "ended"
 *   The surrounding subcomponents (StatsPanel renders an `<aside>`,
 *   ProgressBar / Tutorial / HowToPlayModal / GameLoadingSkeleton render
 *   `<div>` wrappers) deliberately avoid extra `<section>` landmarks so
 *   the play surface remains the single semantic region during play.
 *
 *   Existing PlayPage tests cover the play-panel className (W1880), its
 *   ARIA absence (W1935), the with-sidebar wrapper, and per-phase render
 *   gates — but none assert the *count* of `<section>` elements rendered
 *   in the default playing phase. That gap means a new sibling `<section>`
 *   tucked into the sidebar, the toast region, or any subcomponent could
 *   silently land and dilute the landmark structure.
 *
 *   This test fills the gap by rendering through the setup → playing
 *   transition with the smallest possible plugin (no how-to-play, no
 *   settings schema, single-player so the friend banner stays gated)
 *   and asserting `container.querySelectorAll("section").length === 1`.
 *   Any future change that adds or removes a `<section>` in the playing
 *   phase becomes a deliberate update to this test rather than quiet
 *   landmark drift.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-page-section-count-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Play Page Section Count Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the PlayPage default-playing section count test.",
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

describe("PlayPage default-playing section count (W1968)", () => {
  it("renders exactly one `<section>` element in the playing phase", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup phase so the playing branch mounts the
    // single `.play-panel` host section. This unmounts the setup-panel
    // section and the end-panel section never mounts (game isn't
    // terminal in the fixture).
    fireEvent.click(screen.getByTestId("start-game"));

    const sections = container.querySelectorAll("section");
    expect(sections.length).toBe(1);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
