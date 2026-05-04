/**
 * Unit test for the PlayPage friend button inner-SVG `focusable="false"`
 * attribute contract (W1340 — analog of the sibling header-iconbar
 * single-attribute pins on this same button: W797 (analytics breadcrumb),
 * W968 (data-tooltip), W972 (no aria-keyshortcuts), W1257 (className),
 * and the type/aria-label pin in PlayPage.headerFriendButton.test.tsx).
 *
 * Observable behavior:
 *   PlayPage.tsx renders a `<button data-testid="play-friend-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and
 *   (b) the active plugin is flagged `players.multiplayer: true`. Inside
 *   that button is a single decorative `<svg>` icon (the "share to a
 *   contact" glyph). That SVG carries TWO independent accessibility
 *   attributes that work together:
 *
 *     - `aria-hidden="true"` -- removes the SVG subtree from the
 *       accessibility tree so screen readers announce only the
 *       button's `aria-label="Play with a friend"`.
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
 *   only the ARIA props) would still pass every screen-reader contract,
 *   but would silently re-introduce the phantom-tab-stop bug for
 *   keyboard users on legacy engines. None of the existing friend-btn
 *   tests look at the inner SVG at all -- they all assert on the
 *   <button> wrapper -- so a `focusable=` regression slips past every
 *   one.
 *
 * Strategy: mirrors W968 / W1257 single-attribute-pin pattern, but
 * targets the descendant SVG via `btn.querySelector("svg")` instead of
 * the button element itself. Multiplayer-capable hoisted fixture is
 * required because the friend button only mounts when the active
 * plugin advertises `players.multiplayer: true`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture — vi.hoisted runs before vi.mock
// factories evaluate. `players.multiplayer: true` is the gate that
// mounts the friend button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "friend-svg-focusable-fixture";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Friend SVG Focusable Fixture",
    category: "cards" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description:
      "Test-only multiplayer plugin for the friend btn inner-SVG focusable=false test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number): State => ({ seed }),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-seed">{state.seed}</span>
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

describe("PlayPage friend button inner-SVG focusable='false' contract (W1340)", () => {
  it("pins focusable='false' on the descendant <svg> so legacy engines do not insert a phantom tab stop between the button and the next focusable element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Friend button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-friend-btn") as HTMLButtonElement;
    const svg = btn.querySelector("svg");

    // Sanity: the button contains exactly one decorative glyph.
    expect(svg).not.toBeNull();

    // The SVG-keyboard-navigation pin: dropping focusable="false" (or
    // setting it to "true") would re-introduce the legacy phantom-tab-
    // stop bug for keyboard users on older engines, and no other
    // friend-btn test would catch it.
    expect(svg!.getAttribute("focusable")).toBe("false");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
