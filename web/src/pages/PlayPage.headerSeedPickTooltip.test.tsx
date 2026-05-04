/**
 * Unit test for the PlayPage header seed-pick button data-tooltip
 * attribute contract (W978).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1843) renders a `<button data-testid=
 *   "play-seed-pick-btn">` in the header iconbar whenever
 *   `phase === "playing"` (it sits next to the seed-display). The button
 *   carries a `data-tooltip="Pick seed"` attribute that the toolbar's CSS
 *   hover-tooltip layer reads to render the floating label on pointer
 *   hover. The native `title="Pick seed"` is also present, but the
 *   `data-tooltip` is the contract our toolbar tooltip CSS targets, so a
 *   regression that dropped or renamed it would silently lose the hover
 *   label without any other test catching it.
 *
 *   Sibling tooltip tests (W935 redo, W947/W953 undo/hint, W963 friend,
 *   W965 fullscreen, W967 help, W969 pause, W971 restart, W973 settings)
 *   each pin one button's `data-tooltip` value in isolation. W962's audit
 *   listed `seed-pick-btn` as a data-tooltip-bearing header control whose
 *   value was not yet pinned — this test fills that gap.
 *
 * Strategy mirrors W935 (PlayPage.headerRedoTooltip.test.tsx) — single
 * focused attribute pin — but reuses the W748 R-hotkey test's
 * klondike-id fixture so the seed-pick button mounts (it lives inside
 * the same `phase === "playing"` block as the seed-display, and using
 * the real "klondike" id keeps the toolbar's seed-aware controls in
 * their normal shape). The auto-launched welcome tutorial is suppressed
 * by pre-seeding `cards-tutorial-seen` so the rendered toolbar isn't
 * obscured by a coachmark backdrop.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// We use the real "klondike" id so the toolbar's seed-aware controls
// (including the seed-pick button) render in their normal shape. The
// reducer is a no-op counter — this test never dispatches actions, it
// just inspects the static `data-tooltip` attribute on the button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (seed-pick tooltip test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header seed-pick data-tooltip test.",
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
  // klondike has tutorial steps; without this pre-seed, the auto-launched
  // welcome coachmark would mount on top of the toolbar and could
  // interfere with the rendered tree we care about.
  localStorage.setItem(
    "cards-tutorial-seen",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: true }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header seed-pick button data-tooltip contract (W978)", () => {
  it("pins data-tooltip='Pick seed' so the CSS hover-tooltip layer surfaces a stable label", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The seed-pick button only mounts in the playing phase, so advance
    // past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-seed-pick-btn") as HTMLButtonElement;

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders a
    // floating label by reading `data-tooltip`. Drift to "Choose seed"
    // (verbose copy), accidentally making it dynamic, or losing the
    // attribute entirely (no hover label at all) would all be invisible
    // to every other test on this button.
    expect(btn.getAttribute("data-tooltip")).toBe("Pick seed");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
