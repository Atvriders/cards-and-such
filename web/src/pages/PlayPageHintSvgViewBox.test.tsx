/**
 * Unit test for the PlayPage hint-btn's inner <svg> viewBox attribute (W1352).
 *
 * Observable behavior:
 *   When the page is in `phase === "playing"` and hints are enabled (per
 *   `cards-hints-enabled = "true"`, W775), PlayPage.tsx (~line 2009) renders
 *   a `<button data-testid="play-hint-btn">` whose visible glyph is an
 *   inline lightbulb `<svg>`. That inner svg declares `viewBox="0 0 24 24"`
 *   — the coordinate system that lines up the three inline `<path>` glyph
 *   strokes (the bulb body at 12,2 / 12,7 / etc., the "9 18 h6" base, and
 *   the "10 22 h4" stem) at the intended size. Sibling tests cover the
 *   button's tagName/type/aria-label/svg-presence (W922), the static title
 *   (W1252) and cooldown title/aria-label (W1253/W1254), the className
 *   (W1254), the data-tooltip (W953), and aria-keyshortcuts absence
 *   (W1255) — but none assert the inner svg's `viewBox`. A refactor that
 *   swapped the viewBox for `0 0 16 16` (or removed it entirely) would
 *   silently distort the lightbulb glyph (or render a 1px speck on a
 *   browser default 300x150 svg viewport) without breaking any existing
 *   test.
 *
 * Strategy mirrors W1343 (PlayPageHelpSvgViewBox.test.tsx) — single
 * focused attribute pin on a hint-btn descendant svg:
 *   - Hoisted minimal fixture plugin with a no-op `hint()` so the iconbar
 *     branch (`phase === "playing" && hintsEnabled`) renders the button
 *     in its enabled state (`disabled={!plugin.hint || ...}` is false).
 *   - Pre-seed `cards-hints-enabled = "true"` so the gate is open and
 *     `cards-hint-cooldown = "false"` so the cooldown branch doesn't
 *     re-render the glyph state mid-test.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Locate the descendant `<svg>` of the hint button and read its
 *     `viewBox` attribute directly via `getAttribute`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "hint-svg-viewbox-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint SVG ViewBox Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the hint-btn inner-svg viewBox attribute test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // Returning a selector that won't match anything is fine — this test
    // never clicks the button, it only inspects its rendered attributes.
    hint: () => ({ selector: "[data-testid='nonexistent']" }),
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
  // Hints are gated by a Settings → Gameplay toggle (`cards-hints-enabled`).
  // Make the on-state explicit so this test isn't subject to default
  // changes elsewhere (per W775 finding).
  localStorage.setItem("cards-hints-enabled", "true");
  // Disable the cooldown gate so the button is rendered in its idle
  // state and the SVG glyph is the only icon-area child being inspected.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage hint-btn inner svg viewBox (W1352)", () => {
  it("hint-btn's inner <svg> exposes viewBox='0 0 24 24' while phase === 'playing'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Hint button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const hintBtn = screen.getByTestId("play-hint-btn");
    const svg = hintBtn.querySelector("svg");
    expect(svg).not.toBeNull();
    // Pin the coordinate-system contract — the inline lightbulb paths
    // (the bulb body authored at 12,2 / 12,16 / etc., the 9–18→h6 base,
    // and the 10–22→h4 stem) are all authored against a 24x24 user
    // space. A swap to any other viewBox would distort or shrink the
    // visible glyph without altering any other test surface on this
    // button.
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
  });
});

void React;
