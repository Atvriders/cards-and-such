/**
 * Unit test for the PlayPage header undo button aria-keyshortcuts contract
 * (W934 — analog of W923 which pinned the redo button's aria-keyshortcuts).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1962) renders a `<button data-testid="play-undo-btn">`
 *   in the header iconbar whenever `phase === "playing"`. The button carries
 *   an `aria-keyshortcuts="Control+Z Meta+Z"` attribute so assistive tech
 *   can announce the two supported undo hotkey combos (Windows/Linux
 *   Control+Z and macOS Meta+Z). The sibling redo-button keyshortcuts
 *   contract is pinned by W923 (PlayPage.headerRedoButton.test.tsx) but no
 *   existing test pins undo's aria-keyshortcuts — a regression that dropped
 *   "Meta+Z" on macOS, mistyped "Ctrl+Z" (the AOM canonical token is
 *   "Control+Z"), or lost the attribute entirely would slip past every
 *   existing undo test (headerUndoButton, undoGating, redoButton).
 *
 * Strategy mirrors W923 (PlayPage.headerRedoButton.test.tsx):
 *   - Hoisted minimal counter fixture so the test pulls in zero real-game
 *     code paths.
 *   - Mount at `/play/:gameId`, advance past setup → playing phase.
 *   - Pin the aria-keyshortcuts string exactly. ONE assertion, narrow scope.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — minimal plugin sufficient to drive PlayPage into
// the playing phase. The reducer doesn't need to push undo frames for this
// test because the static aria-keyshortcuts attribute is rendered as soon as
// phase === "playing", regardless of undo-stack depth.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-undo-keyshortcuts-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Undo Keyshortcuts Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header undo aria-keyshortcuts test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
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

describe("PlayPage header undo button aria-keyshortcuts contract (W934)", () => {
  it("pins aria-keyshortcuts to 'Control+Z Meta+Z' so AT can announce both Windows/Linux and macOS undo hotkeys", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Undo button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-undo-btn") as HTMLButtonElement;

    // Hotkey-discovery contract — assistive tech reads aria-keyshortcuts to
    // surface the supported combos. The AOM canonical key tokens are
    // "Control" (not "Ctrl") and "Meta" (not "Cmd"); drift to a friendlier
    // but non-canonical spelling, or dropping the macOS Meta+Z combo, would
    // silently break shortcut announcement.
    expect(btn.getAttribute("aria-keyshortcuts")).toBe("Control+Z Meta+Z");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
