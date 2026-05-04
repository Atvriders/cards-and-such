/**
 * W1181 — focused test for the PAUSED-state branch of the PlayPage header
 * pause button native `title` attribute contract.
 *
 * Observable behavior:
 *   PlayPage.tsx (line 1815) renders
 *     title={paused ? "Resume (Esc)" : "Pause (Esc)"}
 *   on the `<button data-testid="play-pause-btn">`. Sibling test
 *   PlayPage.headerPauseTitle.test.tsx (W1177) pins the *unpaused* branch
 *   ("Pause (Esc)"); this test pins the *paused* branch ("Resume (Esc)").
 *
 *   Without this companion, the paused branch of the ternary is unguarded:
 *   a regression that aliased the paused title to the data-tooltip bare
 *   verb ("Resume"), dropped the "(Esc)" keybinding hint, or swapped the
 *   verb ("Continue", "Unpause") would slip past every existing test on
 *   this button — W1177 only sees the unpaused string, W917
 *   (timerPausedAria) only inspects the timer markup, and W924/W926
 *   (headerPauseButton) only assert the aria-label/aria-pressed/glyph.
 *
 * Strategy mirrors W1177 (single focused attribute pin) plus the Esc-to-
 * pause step from W1146 (pausedResumeBtn): advance into the playing phase,
 * fire an Escape keydown to flip `paused` true, then assert the toolbar
 * pause button's native `title` is "Resume (Esc)".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The pause button has no plugin-shape gating, so a bare fixture is enough;
// we just need *some* plugin to mount and a `start-game` click path to
// advance the phase to "playing" before pressing Escape to pause.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-pause-resume-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Pause Resume Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the W1181 paused-branch native-title test.",
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

describe("PlayPage header pause button native title — paused branch (W1181)", () => {
  it("pins title='Resume (Esc)' on the toolbar pause button after pressing Esc, so the native long-hover tooltip surfaces the keyboard-shortcut hint for resuming on platforms that don't expose aria-keyshortcuts", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pause button only mounts in the playing phase (W724 verified it is
    // *hidden* during setup), so advance past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    // Press Escape to flip `paused` true so the ternary at PlayPage.tsx:1815
    // selects the "Resume (Esc)" branch.
    fireEvent.keyDown(window, { key: "Escape" });

    const btn = screen.getByTestId("play-pause-btn") as HTMLButtonElement;

    // Pin the paused branch literally — the (Esc) keybinding hint must
    // remain on the native title even when the verb flips to "Resume",
    // because aria-keyshortcuts is intentionally absent (W963) and the
    // data-tooltip / aria-label both surface the bare verb.
    expect(btn.getAttribute("title")).toBe("Resume (Esc)");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
