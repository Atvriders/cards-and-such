/**
 * Unit test for the PlayPage header restart/giveup button inner-SVG
 * `focusable="false"` attribute contract (W1915 — analog of the sibling
 * single-attribute pins on this same button: W925 (tagName/type/aria-label),
 * W1166 (title), W954 (data-tooltip), W1858 (className), W1283
 * (inner-SVG aria-hidden), and W1340 (the equivalent focusable pin on
 * the friend button's SVG).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2050) renders a `<button data-testid="play-restart-btn">`
 *   in the header iconbar whenever `phase === "playing"`. Inside that
 *   button is a single decorative `<svg>` icon (the counter-clockwise-
 *   arrow restart glyph). That SVG carries TWO independent accessibility
 *   attributes that work together:
 *
 *     - `aria-hidden="true"` -- removes the SVG subtree from the
 *       accessibility tree so screen readers announce only the
 *       button's `aria-label="Restart"` (pinned by W1283).
 *
 *     - `focusable="false"` -- prevents legacy IE/Edge from making
 *       the inner SVG itself a separate Tab stop (older SVG-in-button
 *       implementations would otherwise insert a phantom tab stop
 *       between the button and the next focusable element, breaking
 *       keyboard navigation order).
 *
 *   `focusable="false"` is the SVG-specific keyboard-navigation pin and
 *   is distinct from `aria-hidden`. A regression that dropped just
 *   `focusable="false"` (e.g. an icon-component refactor that forwarded
 *   only the ARIA props) would still pass every screen-reader contract
 *   AND every other restart-btn assertion (tagName/type/aria-label/title/
 *   data-tooltip/className/inner-svg-aria-hidden), but would silently
 *   re-introduce the phantom-tab-stop bug for keyboard users on legacy
 *   engines. None of the existing restart-btn tests look at the inner
 *   SVG's `focusable` attribute -- W1283 only pins `aria-hidden` -- so
 *   a `focusable=` regression slips past every one.
 *
 * Strategy mirrors W1340 (PlayPageFriendSvgFocusable.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-
 *     game code paths. The restart button renders unconditionally while
 *     phase === "playing" (no multiplayer/schema/state preconditions),
 *     so the fixture is intentionally bare.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid, drill to its inner <svg>.
 *   - Assert getAttribute("focusable") === "false". ONE focused assertion.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — vi.hoisted runs before vi.mock factories
// evaluate. The restart button mounts whenever phase === "playing", so
// no special plugin shape is required.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "restart-svg-focusable-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Restart SVG Focusable Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the restart-btn inner-SVG focusable=false test.",
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

describe("PlayPage header restart button inner-SVG focusable='false' contract (W1915)", () => {
  it("pins focusable='false' on the decorative inner <svg> so legacy engines do not insert a phantom tab stop between the restart button and the next focusable element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Restart button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn") as HTMLButtonElement;
    const svg = btn.querySelector("svg");

    // Sanity: the button contains exactly one decorative glyph.
    expect(svg).not.toBeNull();

    // The SVG-keyboard-navigation pin: dropping focusable="false" (or
    // setting it to "true") would re-introduce the legacy phantom-tab-
    // stop bug for keyboard users on older engines, and no other
    // restart-btn test (W925/W1166/W954/W1858/W1283) would catch it.
    expect(svg!.getAttribute("focusable")).toBe("false");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
