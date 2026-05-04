/**
 * Unit test for the PlayPage header pause button inner-SVG
 * `aria-hidden="true"` contract (W1288).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1809) renders a `<button data-testid="play-pause-btn">`
 *   in the header iconbar whenever `phase === "playing"`. The button is
 *   icon-only and carries `aria-label="Pause"` (or "Resume"), which IS the
 *   screen-reader label. The inner pause-bars `<svg>` glyph is purely
 *   decorative and is therefore marked `aria-hidden="true"` so assistive
 *   tech does not double-announce it alongside the button's aria-label.
 *
 *   Sibling tests pin the button's tagName, type, aria-label, aria-pressed,
 *   title, data-tooltip, and the intentional absence of aria-keyshortcuts:
 *     - W924/W926 (headerPauseButton)        — tag/type/aria-label/aria-pressed/glyph existence
 *     - W960     (headerPauseTitle)          — title="Pause (Esc)"
 *     - W961     (headerPauseResumeTitle)    — title="Resume (Esc)"
 *     - W962     (headerPauseTooltip)        — data-tooltip="Pause"
 *     - W963     (headerPauseKeyshortcuts)   — absence of aria-keyshortcuts
 *     - W964     (headerPauseResumeAriaLabel)— aria-label="Resume" when paused
 *
 *   None of them assert anything about the *inner SVG's* `aria-hidden`
 *   attribute. A regression that dropped the `aria-hidden` (or set it to
 *   "false") would let AT announce the decorative <rect> path nodes
 *   alongside the button label, creating a confusing double-announcement
 *   that visual tests would never catch.
 *
 * Strategy mirrors W1283 (PlayPageRestartSvgAriaHidden.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-game
 *     code paths.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the pause button via its testid, drill to its inner <svg>.
 *   - Assert getAttribute("aria-hidden") === "true". ONE focused assertion.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — minimal plugin sufficient to drive PlayPage into
// the playing phase. The pause button renders whenever phase === "playing"
// (no schema/state preconditions), so this fixture is intentionally bare.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "pause-svg-aria-hidden-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Pause SVG aria-hidden Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the pause-btn inner-SVG aria-hidden test.",
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

describe("PlayPage header pause button inner-SVG aria-hidden contract (W1288)", () => {
  it("marks the decorative inner <svg> with aria-hidden='true' so AT does not double-announce the pause-bars glyph alongside the button's aria-label", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pause button only mounts in the playing phase; advance past setup.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-pause-btn");
    const svg = btn.querySelector("svg");

    // Decorative-icon a11y contract — the button's aria-label "Pause"
    // is the only announced label; the SVG glyph must be hidden from AT
    // so screen readers do not double-announce its path/rect nodes.
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("aria-hidden")).toBe("true");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
