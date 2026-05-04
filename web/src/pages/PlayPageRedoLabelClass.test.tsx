/**
 * Unit test for the PlayPage primary-toolbar redo button's inner visible
 * label span `className` (W1437).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2003) renders the trailing visible label span as
 *   `<span className="play-hint-btn-label" data-testid="play-redo-btn-label">`
 *   when the "Show undo count" preference is on. That `className` is what
 *   the toolbar stylesheet (`.play-hint-btn-label`) hooks into for layout —
 *   typography, spacing, and the chip-style baseline alignment with the
 *   "↻" glyph all key off it. Despite the redo button having extensive
 *   coverage (W923 outer attrs, W935 data-tooltip, W1127 count-label
 *   text + aria-label, W1140 disabled title, W1152 enabled title, W1302
 *   inner glyph style), no existing test pins the `className` on the
 *   inner label span. A regression that dropped the class, renamed it to
 *   `play-redo-btn-label`, or merged it into the parent button would slip
 *   past every existing PlayPage test.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - Flip the `cards-show-undo-count` flag *before* PlayPage mounts so
 *     `useState(() => readShowUndoCount())` picks up the truthy branch
 *     and the inner label span actually renders.
 *   - Mount at `/play/:gameId`, click `start-game`, then look up the
 *     label span by its testid and assert `className` is exactly
 *     "play-hint-btn-label" (no extra classes, no drift). Also assert
 *     `tagName === "SPAN"` so a refactor to a `<div>` (which would break
 *     the inline button layout) is caught.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — vi.hoisted runs before vi.mock factories
// evaluate, so the registry mock below can close over `fixturePlugin`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "redo-label-class-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Redo Label Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo-label-class test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div data-testid="fx-count">{state.count}</div>
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
  // Flip the "Show undo count" preference *before* PlayPage mounts so the
  // inner label span actually renders. Key matches LS_SHOW_UNDO_COUNT at
  // PlayPage.tsx ~line 162.
  localStorage.setItem("cards-show-undo-count", "true");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage primary-toolbar redo button inner label className (W1437)", () => {
  it("renders the inner visible label as <span class='play-hint-btn-label'> so the toolbar typography/spacing styles bind correctly", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar redo button (and its inner label span) mount.
    fireEvent.click(screen.getByTestId("start-game"));

    const label = screen.getByTestId("play-redo-btn-label");

    // Tag contract — the label is a phrasing-content <span> so it can sit
    // inline next to the "↻" glyph inside the <button>. A refactor to a
    // <div> (block-level inside an interactive button) would also be a
    // valid HTML regression.
    expect(label.tagName).toBe("SPAN");

    // Class contract — exact-equal so a regression that dropped the class
    // (style sheet bind would silently break), renamed it to
    // `play-redo-btn-label`, or appended drift like
    // `play-hint-btn-label play-redo-btn-label` would all fail loudly.
    expect(label.className).toBe("play-hint-btn-label");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
