/**
 * Unit test for the PlayPage header redo button data-tooltip attribute
 * contract (W935 — analog of W924 which pinned the undo button's UI shape
 * but did NOT pin its sibling `data-tooltip` attribute).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1986) renders a `<button data-testid="play-redo-btn">`
 *   in the header iconbar whenever `phase === "playing"`. The button carries
 *   a `data-tooltip="Redo"` attribute that the toolbar's CSS hover-tooltip
 *   layer reads to render the floating label on pointer hover (the native
 *   `title="..."` is suppressed on touch devices and on focus-only flows
 *   where the OS tooltip would never appear). The undo button has the same
 *   contract via `data-tooltip="Undo"` (noted in W924) — but no existing
 *   test on either undo or redo pins the `data-tooltip` value, so a
 *   regression that swapped it for "Redo move" (drift), dropped the
 *   attribute entirely (breaking the CSS hover label), or duplicated the
 *   undo-button's "Undo" string (copy-paste bug) would slip past every
 *   existing test.
 *
 *   Sibling tests cover other facets of the same button:
 *     - W923 (headerRedoButton) pins tagName/type/aria-label/aria-keyshortcuts/
 *       className/glyph and the disabled→enabled gating
 *     - W208 (redoButton) covers the click-to-redo flow
 *   Neither asserts anything about `data-tooltip`.
 *
 * Strategy mirrors W934 (PlayPage.headerUndoKeyshortcuts.test.tsx) — single
 * focused attribute pin:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly with
 *     no real-game code paths pulled in.
 *   - Mount at `/play/:gameId`, advance past setup → playing phase.
 *   - Locate the redo button via its testid and pin `data-tooltip` exactly.
 *     The button is rendered (just `disabled`) as soon as phase === "playing"
 *     regardless of redo-stack depth, so we don't need to dispatch+undo to
 *     enable it — the static `data-tooltip` attribute is present from the
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
  const TEST_GAME_ID = "header-redo-tooltip-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Redo Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header redo data-tooltip test.",
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

describe("PlayPage header redo button data-tooltip contract (W935)", () => {
  it("pins data-tooltip='Redo' so the CSS hover-tooltip layer surfaces the correct label on pointer hover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Redo button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders a
    // floating label by reading `data-tooltip`. Drift to "Redo move" (verbose
    // copy), the undo-button's "Undo" (copy-paste bug), or losing the
    // attribute entirely (no hover label at all) would all be invisible to
    // every other test on this button.
    expect(btn.getAttribute("data-tooltip")).toBe("Redo");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
