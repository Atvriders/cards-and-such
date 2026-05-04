/**
 * Unit test for the PlayPage help-btn's inner <svg> viewBox attribute (W1343).
 *
 * Observable behavior:
 *   When the page is in `phase === "playing"` and the active plugin defines
 *   `howToPlay` text (or `tutorialSteps`), the toolbar renders a
 *   `<button data-testid="help-btn">` (PlayPage.tsx ~line 2125) whose only
 *   visible child is a decorative `<svg>` question-mark glyph. That inner svg
 *   declares `viewBox="0 0 24 24"` — the coordinate system that makes the
 *   inline `<circle cx="12" cy="12" r="10">`, the `<path>` for the curl of
 *   the question mark, and the `<line>` for the dot all line up at the
 *   intended size. Sibling tests cover the button's tagName/type/aria-label/
 *   svg-presence (W914), native `title` (W1185), `data-tooltip` (W970), and
 *   `aria-keyshortcuts` absence — but none assert the inner svg's `viewBox`.
 *   A refactor that swaps the viewBox for `0 0 16 16` (or removes it
 *   entirely) would silently distort the glyph (or render a 1px speck on a
 *   browser default 300x150 svg viewport) without breaking any existing test.
 *
 * Strategy mirrors W1264 (PlayPageFullscreenSvgFocusable.test.tsx) — single
 * focused attribute pin on a help-btn descendant svg:
 *   - Hoisted minimal fixture plugin with `howToPlay` text so the iconbar
 *     branch (`plugin.howToPlay || tutorialSteps`) renders the help button.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Locate the descendant `<svg>` of the help button and read its
 *     `viewBox` attribute directly via `getAttribute`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "help-svg-viewbox-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Help SVG ViewBox Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the help-btn inner-svg viewBox attribute test.",
    howToPlay: "Click cards to play. Match suits to win.",
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

describe("PlayPage help-btn inner svg viewBox (W1343)", () => {
  it("help-btn's inner <svg> exposes viewBox='0 0 24 24' while phase === 'playing'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Help button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const helpBtn = screen.getByTestId("help-btn");
    const svg = helpBtn.querySelector("svg");
    expect(svg).not.toBeNull();
    // Pin the coordinate-system contract — the inline glyph paths
    // (`circle r="10"`, the question-mark `<path>`, and the dot `<line>`
    // all at `12, 17`) are authored against a 24x24 user space. A swap to
    // any other viewBox would distort or shrink the visible glyph without
    // altering any other test surface on this button.
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
  });
});

void React;
