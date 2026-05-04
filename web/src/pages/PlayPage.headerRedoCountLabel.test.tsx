/**
 * Unit test for the PlayPage primary-toolbar redo button "show count" branch
 * (W1127).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1992) renders the redo button's `aria-label` as
 *   `"Redo, N step(s) available"` (with proper "step" / "steps" pluralization)
 *   when the user-facing "Show undo count" preference is on, and *also*
 *   renders a visible `<span data-testid="play-redo-btn-label">` with text
 *   `"Redo (N)"` next to the "↻" glyph (~line 2002).
 *
 *   The default branch (showUndoCount = false) is exercised indirectly by
 *   existing redo-button tests, but the *true* branch — driven by the
 *   `cards-show-undo-count` localStorage flag (see `readShowUndoCount` at
 *   PlayPage.tsx ~line 207, key `LS_SHOW_UNDO_COUNT` at ~line 162) — has
 *   zero coverage for the redo button. The undo branch is pinned by W948
 *   (PlayPage.headerUndoCountLabel.test.tsx); this is its symmetric twin.
 *   A regression that dropped the count from the redo aria-label, removed
 *   the trailing `<span>` entirely, or regressed pluralization (e.g.
 *   "1 steps available") would slip past every existing PlayPage test.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - In `beforeEach`, *after* `localStorage.clear()`, set the
 *     "cards-show-undo-count" flag to "true" so the freshly-mounted
 *     PlayPage's `useState` initializer (which reads `readShowUndoCount()`
 *     synchronously) picks up the truthy branch.
 *   - Mount at `/play/:gameId`, click `start-game`, and assert:
 *       1. With redoStack empty (right after start), aria-label is exactly
 *          "Redo, 0 steps available" — pins the plural-"steps" form.
 *       2. The trailing `<span data-testid="play-redo-btn-label">` is
 *          present and reads "Redo (0)".
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
  const TEST_GAME_ID = "header-redo-count-label-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Redo Count Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo-count-label test.",
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
  // Flip the "Show undo count" preference *before* PlayPage mounts so its
  // `useState(() => readShowUndoCount())` initializer picks up the truthy
  // branch. Key matches LS_SHOW_UNDO_COUNT at PlayPage.tsx:162.
  localStorage.setItem("cards-show-undo-count", "true");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage primary-toolbar redo button show-count branch (W1127)", () => {
  it("renders the count-bearing aria-label and visible label span when 'Show undo count' is on", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar redo button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-redo-btn");

    // Aria-label contract for the truthy branch — count-bearing form with
    // the plural "steps" (redoStack is empty right after start, so N=0).
    // A regression that dropped the count, miscounted, or singularized
    // "step" for N=0 would break here.
    expect(btn.getAttribute("aria-label")).toBe("Redo, 0 steps available");

    // The trailing visible label span only renders when showUndoCount is
    // true — its presence is the sighted-user signal that mirrors the
    // a11y count. Removing the conditional `<span>` block (~PlayPage.tsx
    // line 2002) would make this lookup throw.
    const label = screen.getByTestId("play-redo-btn-label");
    expect(label.textContent?.trim()).toBe("Redo (0)");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
