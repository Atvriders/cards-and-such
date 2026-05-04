/**
 * Unit test for the PlayPage header seed-pick button native `title`
 * attribute contract (W1187).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1843) renders a `<button data-testid=
 *   "play-seed-pick-btn">` in the header iconbar whenever
 *   `phase === "playing"` (it sits next to the seed-display). The button
 *   carries both a `data-tooltip="Pick seed"` (pinned by W978's sibling
 *   test) and a native `title="Pick seed"` attribute. The native `title`
 *   is the platform-level fallback tooltip that browsers/AT surface when
 *   the CSS hover-tooltip layer is unavailable (forced-colors, mobile
 *   long-press, screen reader bypass), so a regression that dropped or
 *   renamed it would silently strip the platform tooltip without any
 *   other test on this button catching it.
 *
 *   W978 already pins `data-tooltip` on this same button. This test fills
 *   the symmetric gap for the native `title` attribute, mirroring how
 *   sibling header controls each have separate pins for the two tooltip
 *   surfaces.
 *
 * Strategy mirrors W978 (PlayPage.headerSeedPickTooltip.test.tsx) — single
 * focused attribute pin — and reuses the same klondike-id fixture so the
 * seed-pick button mounts (it lives inside the `phase === "playing"`
 * block). The auto-launched welcome tutorial is suppressed by pre-seeding
 * `cards-tutorial-seen` so the rendered toolbar isn't obscured by a
 * coachmark backdrop.
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
// just inspects the static `title` attribute on the button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (seed-pick title test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header seed-pick native title test.",
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

describe("PlayPage header seed-pick button native title contract (W1187)", () => {
  it("pins title='Pick seed' so the platform-level tooltip fallback stays stable", async () => {
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

    // Native `title` contract — the browser/AT-level tooltip fallback
    // surfaces this string when the CSS hover-tooltip layer is
    // unavailable (forced-colors, mobile long-press, screen reader
    // bypass). Drift to "Choose seed" (verbose copy), accidentally
    // making it dynamic, or losing the attribute entirely would all be
    // invisible to every other test on this button.
    expect(btn.getAttribute("title")).toBe("Pick seed");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
