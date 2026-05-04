/**
 * Unit test for the PlayPage header pause button UI contract (W926).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1809) renders a `<button data-testid="play-pause-btn">`
 *   in the header iconbar whenever `phase === "playing"`. It is a
 *   `type="button"` (so a stray wrapping form can never submit), it
 *   carries an aria-label of "Pause" while the timer is running
 *   (announcing intent to screen readers — the only label, since the
 *   button is icon-only), and it shows a visible "two vertical bars"
 *   pause SVG glyph. Sibling tests cover related concerns — W724 pinned
 *   that the button is *hidden* during setup, and W917 pinned the
 *   timer's paused-state markup once the button has been clicked — but
 *   no test pins the *static UI contract* of the button itself in its
 *   default (running) state, so a regression that swapped the
 *   aria-label for "Toggle pause" (drift), set `type="submit"`
 *   (form-bug), or replaced the inline pause-bars SVG with a text
 *   glyph (e.g. "‖") would slip past every existing test.
 *
 *   The button only mounts when `phase === "playing"`, so we mock a
 *   minimal fixture plugin and click `start-game` to advance past
 *   setup before locating it. We assert the *unpaused* glyph and
 *   aria-label (the default state right after start-game) — the
 *   paused-state variants are exercised by W917.
 *
 * Strategy mirrors PlayPage.headerInfoButton.test.tsx (W900) and
 * PlayPage.headerSettingsButton.test.tsx (W906):
 *   - Hoisted minimal fixture plugin so the iconbar branch resolves
 *     cleanly without depending on a real game's setup flow.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Pin five static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Pause" (screen-reader contract, running state).
 *       4. aria-pressed === "false" (toggle-button semantics, unpaused).
 *       5. an inline <svg> glyph child (visible pause-bars contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The pause button has no plugin-shape gating (unlike help/settings, which
// require howToPlay or a non-empty settings schema), so a bare fixture is
// enough — we just need *some* plugin to mount and a `start-game` click
// path to advance the phase to "playing".
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-pause-btn-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Pause Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header pause-button UI test.",
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

describe("PlayPage header pause button UI contract (W926)", () => {
  it("renders a <button type='button'> with the 'Pause' a11y label, aria-pressed='false', and visible SVG pause-bars glyph in the running state", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pause button only mounts in the playing phase (W724 verified it is
    // *hidden* during setup), so advance past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-pause-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation, and would also
    // break the toggle semantics that aria-pressed relies on.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page when the user
    // hits Enter on the focused pause button.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract (running state) — the button is icon-only,
    // so the aria-label *is* the only label exposed to AT. We assert the
    // unpaused label here; the paused-state label flip is exercised by
    // W917 (paused-timer markup test).
    expect(btn.getAttribute("aria-label")).toBe("Pause");

    // Toggle-button semantics — aria-pressed announces the current
    // pressed state to AT. Right after start-game the timer is running,
    // so the button is *not* pressed.
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    // Visible glyph contract — the only sighted-user signal that this
    // is the pause button. Replacing the inline pause-bars SVG with a
    // text glyph (e.g. "‖") or removing it entirely would break visual
    // recognition while a11y stayed green.
    const svg = btn.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
