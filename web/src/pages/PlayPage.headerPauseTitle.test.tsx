/**
 * Unit test for the PlayPage header pause button native `title` attribute
 * contract (W1177).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1815) renders a `<button data-testid="play-pause-btn">`
 *   whose native `title` attribute is "Pause (Esc)" while running and
 *   "Resume (Esc)" once paused. The browser's native tooltip surfaces this
 *   string on long hover — distinct from the CSS `data-tooltip` floating
 *   label (W962, bare verb "Pause" / "Resume") and from the `aria-label`
 *   (W926, accessible name).
 *
 *   Sibling tests cover other facets of the same button:
 *     - W724  (pauseHiddenSetup)   — hidden during setup
 *     - W917  (timerPausedAria)    — paused-state markup after click
 *     - W924/W926 (headerPauseButton) — tag/type/aria-label/aria-pressed/glyph
 *     - W962  (headerPauseTooltip) — data-tooltip="Pause"
 *     - W963  (headerPauseKeyshortcuts) — absence of aria-keyshortcuts
 *   None of them assert anything about the native `title` attribute, so a
 *   regression that dropped the "(Esc)" keybinding hint, swapped the verb
 *   ("Stop" / "Halt"), or replaced the title with the bare verb — losing
 *   the discoverability cue for the Esc shortcut on devices where
 *   aria-keyshortcuts is not surfaced — would slip past every existing
 *   test on this button.
 *
 * Strategy mirrors W962 (headerPauseTooltip) — single focused attribute pin
 * — and reuses the same fixture shape because the pause button has no
 * plugin-shape gating and only needs the phase to advance to "playing"
 * before mounting.
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
  const TEST_GAME_ID = "header-pause-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Pause Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header pause native-title test.",
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

describe("PlayPage header pause button native title contract (W1177)", () => {
  it("pins title='Pause (Esc)' (verb + '(Esc)' keybinding hint) on the unpaused button so the browser's native long-hover tooltip surfaces the keyboard shortcut even on platforms that don't expose aria-keyshortcuts", async () => {
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

    const btn = screen.getByTestId("play-pause-btn") as HTMLButtonElement;

    // Native browser tooltip contract — long-hover on a `[title]` element
    // shows the OS-rendered tooltip. The string must include the "(Esc)"
    // keybinding hint because W963 documented that the button intentionally
    // does *not* set aria-keyshortcuts; the only discoverable surface for
    // the Esc shortcut on this button is the native title (and the
    // aria-label, but that pins the bare verb for screen readers per W926).
    // Dropping "(Esc)", swapping the verb ("Stop"/"Halt"), or aliasing the
    // title to the data-tooltip bare verb would all silently regress this.
    expect(btn.getAttribute("title")).toBe("Pause (Esc)");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
