/**
 * Unit test for the PlayPage header info button native `title` attribute (W1173).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1683) renders the `<button data-testid="play-info-btn">`
 *   with a native `title="Session info"` attribute alongside its aria-label.
 *
 *   The sibling W900 test (PlayPage.headerInfoButton.test.tsx) only pins the
 *   aria-label, type, aria-haspopup, and visible glyph — it does NOT assert on
 *   the native `title` attribute. The native tooltip is the *sighted mouse
 *   user* affordance (hover reveals "Session info"), parallel to the
 *   aria-label for screen-reader users. A regression that drops or renames
 *   the title attribute would silently degrade hover discoverability while
 *   every existing test stays green.
 *
 *   This pin protects the title contract independently of the aria-label so
 *   the two can drift only if both tests are updated together.
 *
 *   This is general PlayPage UX present in every phase (setup, playing,
 *   ended) so we don't need to start the game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-info-title-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Info Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header info-button title test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
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

describe("PlayPage header info button native title attribute (W1173)", () => {
  it("renders play-info-btn with title='Session info' for hover-tooltip discoverability", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("play-info-btn");

    // Native tooltip contract — hovering the button surfaces "Session info"
    // for sighted mouse users. The aria-label covers AT users; the title
    // attribute is the *separate* mouse-hover affordance and must not drift.
    expect(btn.getAttribute("title")).toBe("Session info");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
