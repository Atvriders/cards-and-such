/**
 * Unit test for the PlayPage undo button inner-glyph aria-hidden contract
 * (W1261 — matching coverage for W923 which pinned the redo button's
 * `<span aria-hidden="true">↻</span>` glyph wrapper but left the undo
 * button's analogous wrapper unpinned).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1977) renders the undo button's `⟲` glyph wrapped
 *   in a dedicated `<span aria-hidden="true">` so screen readers do NOT
 *   announce the decorative arrow alongside the button's `aria-label`
 *   ("Undo" / "Undo, N steps available"). Without `aria-hidden="true"` AT
 *   would double-announce the glyph as "white circle reverse arrow" or
 *   read the codepoint, polluting the otherwise clean a11y label.
 *
 *   Sibling tests cover other facets of the same button but none of them
 *   query the inner glyph span:
 *     - W924 (headerUndoButton) pins tagName / type / aria-label /
 *       textContent (the visible glyph string) but never queries the
 *       wrapper span itself, so dropping `aria-hidden` from the wrapper
 *       (or hoisting the glyph onto the button so it lacks a wrapper at
 *       all) would still pass W924.
 *     - W923 (headerRedoButton) pins the *redo* button's
 *       `span[aria-hidden='true']` glyph wrapper — symmetric coverage
 *       only, the undo wrapper is untested.
 *     - W934 / W947 / undo-title / undo-keyshortcuts / undoGating cover
 *       other attributes; none touch the inner span's aria-hidden.
 *
 * Strategy mirrors W923's redo-glyph assertion — single focused attribute
 * pin via `querySelector("span[aria-hidden='true']")` and a textContent
 * trim check to make sure the matched span really is the glyph wrapper:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, advance past setup → playing phase.
 *   - Locate the undo button via testid; assert its descendant
 *     `span[aria-hidden='true']` exists and wraps the `⟲` glyph.
 *     The wrapper renders unconditionally while phase === "playing",
 *     so no actions are needed to enable it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — minimal plugin sufficient to drive PlayPage into
// the playing phase. No reducer behavior is exercised here; the static
// inner-glyph span renders unconditionally while phase === "playing".
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "undo-glyph-aria-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Undo Glyph Aria Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the undo glyph aria-hidden test.",
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

describe("PlayPage undo button inner-glyph aria-hidden contract (W1261)", () => {
  it("wraps the '⟲' glyph in a <span aria-hidden='true'> so screen readers don't double-announce the decorative arrow alongside the button's aria-label", async () => {
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

    // a11y contract — the decorative '⟲' glyph MUST live inside a wrapper
    // span carrying aria-hidden="true" so AT skips it and reads only the
    // button's `aria-label` ("Undo" / "Undo, N steps available"). Drift
    // that flips this to aria-hidden="false", drops the attribute, or
    // hoists the glyph directly onto the button (no wrapper) would make
    // AT announce the codepoint or its Unicode name — invisible to every
    // other test on this button (W924 only checks textContent, which
    // collapses regardless of nesting).
    const glyphSpan = btn.querySelector("span[aria-hidden='true']");
    expect(glyphSpan).not.toBeNull();
    expect(glyphSpan?.textContent?.trim()).toBe("⟲");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
