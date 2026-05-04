/**
 * Unit test for the PlayPage header restart button data-tooltip attribute
 * contract (W954 — analog of W935 (redo) and W947 (undo) which pinned the
 * `data-tooltip` value for those sibling header buttons).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2047) renders a `<button data-testid="play-restart-btn">`
 *   in the header iconbar whenever `phase === "playing"`. The button carries
 *   a `data-tooltip="Restart"` attribute that the toolbar's CSS hover-tooltip
 *   layer reads to render the floating label on pointer hover (the native
 *   `title="..."` is suppressed on touch devices and on focus-only flows
 *   where the OS tooltip would never appear). The undo/redo buttons have
 *   the same contract (`data-tooltip="Undo"`/`"Redo"`, pinned in W947/W935
 *   respectively) — but no existing test on the restart button pins its
 *   `data-tooltip` value, so a regression that swapped it for "Reset"
 *   (drift), "Restart game" (verbose), dropped the attribute entirely
 *   (breaking the CSS hover label), or duplicated a sibling's tooltip
 *   string (copy-paste bug) would slip past every existing test.
 *
 *   Sibling tests cover other facets of the same button:
 *     - W925 (headerRestartButton) pins tagName/type/aria-label/className/glyph
 *     - replay-action and R-hotkey tests cover the click and keyboard flows
 *   None asserts anything about `data-tooltip`.
 *
 * Strategy mirrors W935 (PlayPage.headerRedoTooltip.test.tsx) — single
 * focused attribute pin:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly with
 *     no real-game code paths pulled in.
 *   - Mount at `/play/:gameId`, advance past setup → playing phase.
 *   - Locate the restart button via its testid and pin `data-tooltip`
 *     exactly. The button mounts unconditionally as soon as
 *     phase === "playing", so the static attribute is present from the
 *     first render.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — minimal plugin sufficient to drive PlayPage into
// the playing phase. No reducer behavior is exercised here; the static
// data-tooltip attribute is rendered unconditionally while phase === "playing".
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-restart-tooltip-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Restart Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header restart data-tooltip test.",
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

describe("PlayPage header restart button data-tooltip contract (W954)", () => {
  it("pins data-tooltip='Restart' so the CSS hover-tooltip layer surfaces the correct label on pointer hover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Restart button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn") as HTMLButtonElement;

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders a
    // floating label by reading `data-tooltip`. Drift to "Reset" (different
    // verb), "Restart game" (verbose copy), a sibling's "Undo"/"Redo"
    // (copy-paste bug), or losing the attribute entirely (no hover label
    // at all) would all be invisible to every other test on this button.
    expect(btn.getAttribute("data-tooltip")).toBe("Restart");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
