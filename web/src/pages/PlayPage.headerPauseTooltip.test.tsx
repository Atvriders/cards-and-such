/**
 * Unit test for the PlayPage header pause button data-tooltip attribute
 * contract (W962).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1816) renders a `<button data-testid="play-pause-btn">`
 *   in the header iconbar whenever `phase === "playing"`. Alongside its
 *   `aria-label` (W926) and `title` (which switches between "Pause (Esc)"
 *   and "Resume (Esc)" — the keybinding hint), the button carries a
 *   `data-tooltip` attribute that the toolbar's CSS hover-tooltip layer
 *   reads to render the floating label on pointer hover. Unlike `title`,
 *   the `data-tooltip` value is the bare "Pause" / "Resume" verb without
 *   the "(Esc)" suffix — the floating tooltip surface does not double-up
 *   the keybinding hint. W960 noted that the sibling info-btn does *not*
 *   carry `data-tooltip` while every other toolbar button does, so the
 *   pause button being in the data-tooltip-bearing list is itself a
 *   contract worth pinning.
 *
 *   Sibling tests cover other facets of the same button:
 *     - W724  (pauseHiddenSetup) — button is hidden during setup
 *     - W917  (timerPausedAria) — paused-state markup after click
 *     - W926  (headerPauseButton) — tag/type/aria-label/aria-pressed/glyph
 *     - W?    (pause) — the click-to-pause behavior
 *   None of them assert anything about `data-tooltip` — so a regression
 *   that swapped it for "Pause game" (verbose drift), made it match
 *   `title=` ("Pause (Esc)" — would double the keybinding in the floating
 *   label), or dropped the attribute entirely (no hover label, breaking
 *   the toolbar's tooltip-row consistency that W960 documented) would
 *   slip past every existing test on this button.
 *
 * Strategy mirrors W953 (PlayPage.headerHintTooltip.test.tsx) — single
 * focused attribute pin — and reuses the W926 pause-button fixture shape
 * because the pause button has no plugin-shape gating and only needs the
 * phase to advance to "playing" before mounting.
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
  const TEST_GAME_ID = "header-pause-tooltip-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Pause Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header pause data-tooltip test.",
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

describe("PlayPage header pause button data-tooltip contract (W962)", () => {
  it("pins data-tooltip='Pause' (bare verb, no '(Esc)' keybinding hint) so the CSS hover-tooltip layer surfaces a stable label distinct from the title= cooldown text", async () => {
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

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders a
    // floating label by reading `data-tooltip`. W960 documented that
    // info-btn lacks this attribute while every other toolbar button has
    // it; pinning the pause button on the with-tooltip side of that
    // partition prevents silent drift to "Pause game" (verbose copy),
    // accidental mirroring of `title=` ("Pause (Esc)" — would double-up
    // the keybinding hint in the floating label), or dropping the
    // attribute entirely (which would break the toolbar's hover-row
    // consistency that the rest of the buttons rely on).
    expect(btn.getAttribute("data-tooltip")).toBe("Pause");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
