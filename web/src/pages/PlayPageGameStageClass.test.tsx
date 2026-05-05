/**
 * Pinpoint test for the PlayPage game-stage wrapper className equality
 * (W1880).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2522) renders the active play surface inside a
 *   `<section className={`play-panel play-board${paused ? " play-panel--paused" : ""}`}>`.
 *   This section is the host element that holds `<plugin.component>` —
 *   the per-game React component. Its base className is the exact
 *   string `"play-panel play-board"` while playing and not paused.
 *
 *   Existing tests (PlayPage.playPanelPausedModifier.test.tsx,
 *   PlayPage.playPanelPausedClass.test.tsx) verify the *modifier* class
 *   `play-panel--paused` toggle, but none of them pin the base
 *   wrapper's className with strict equality. That gap means a stray
 *   token addition (e.g. an extra layout class) or token reorder would
 *   slip past CI even though it would alter how PlayPage.css matches
 *   the `.play-panel` and `.play-board` selectors used for the play
 *   surface layout.
 *
 *   This test fills the gap with the minimum surface: render → start
 *   → grab the `.play-panel` section in its non-paused state and
 *   assert `panel.className === "play-panel play-board"` exactly. We
 *   deliberately use `toBe` against the literal string instead of
 *   `classList.contains` so a regression that adds, removes, or
 *   reorders tokens fails loudly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-page-game-stage-class-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Play Page Game Stage Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the PlayPage game-stage className test.",
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

describe("PlayPage game-stage wrapper className (W1880)", () => {
  it("renders the play surface section with className === 'play-panel play-board' while playing", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup phase so the playing branch mounts the
    // `.play-panel` host section that wraps `<plugin.component>`.
    fireEvent.click(screen.getByTestId("start-game"));

    const panel = container.querySelector("section.play-panel");
    expect(panel).not.toBeNull();

    // Strict equality on the literal className: pins token set AND
    // order. Any extra/missing/reordered class triggers a fail —
    // including accidental introduction of `play-panel--paused` while
    // not paused.
    expect((panel as HTMLElement).className).toBe("play-panel play-board");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
