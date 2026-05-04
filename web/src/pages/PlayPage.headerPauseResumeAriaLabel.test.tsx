/**
 * W1184 — focused test for the PAUSED-state branch of the PlayPage header
 * pause button `aria-label` attribute contract.
 *
 * Observable behavior:
 *   PlayPage.tsx (line 1813) renders
 *     aria-label={paused ? "Resume" : "Pause"}
 *   on the toolbar `<button data-testid="play-pause-btn">`. W926
 *   (headerPauseButton) already pins the *unpaused* aria-label ("Pause");
 *   W1146 (pausedResumeBtn) noted the toolbar button reuses the
 *   "Resume" label while paused (which is why that test had to scope to
 *   the overlay via within()). This test pins the *paused* branch of the
 *   ternary directly on the toolbar button.
 *
 *   Without this companion the paused aria-label is unguarded: a
 *   regression that aliased the paused screen-reader label to "Pause" (a
 *   stale literal), "Continue", or "Unpause" would slip past every other
 *   assertion on this button — W926 only sees the unpaused string,
 *   W1181 (headerPauseResumeTitle) only inspects the native title, W917
 *   (timerPausedAria) only inspects the timer markup, and W1146 only
 *   checks the in-overlay Resume button via the role-name lookup.
 *
 * Strategy mirrors W1181 (single focused attribute pin in the paused
 * state): advance into the playing phase, fire an Escape keydown to flip
 * `paused` true, then assert the toolbar pause button's `aria-label` is
 * exactly "Resume".
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
  const TEST_GAME_ID = "header-pause-resume-arialabel-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Pause Resume AriaLabel Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the W1184 paused-branch aria-label test.",
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

describe("PlayPage header pause button aria-label — paused branch (W1184)", () => {
  it("pins aria-label='Resume' on the toolbar pause button after pressing Esc, so screen readers announce the verb that matches the active action (resuming a paused game) rather than a stale 'Pause' label", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pause button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    // Press Escape to flip `paused` true so the ternary at PlayPage.tsx:1813
    // selects the "Resume" branch.
    fireEvent.keyDown(window, { key: "Escape" });

    // The overlay Resume button (PlayPage.tsx:2559) does NOT carry the
    // play-pause-btn testid — only the toolbar button does — so getByTestId
    // unambiguously scopes to the toolbar even though both buttons exist
    // simultaneously while paused (cf. W1146).
    const btn = screen.getByTestId("play-pause-btn") as HTMLButtonElement;

    expect(btn.getAttribute("aria-label")).toBe("Resume");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
