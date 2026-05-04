/**
 * Unit test for the PlayPage primary-toolbar undo button "show count" branch
 * (W948).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1968) renders the undo button's `aria-label` as
 *   `"Undo, N step(s) available"` (with proper "step" / "steps" pluralization)
 *   when the user-facing "Show undo count" preference is on, and *also*
 *   renders a visible `<span data-testid="play-undo-btn-label">` with text
 *   `"Undo (N)"` next to the "⟲" glyph (~line 1978).
 *
 *   The default branch (showUndoCount = false) is already pinned by W924
 *   (PlayPage.headerUndoButton.test.tsx) — that test asserts aria-label is
 *   the short "Undo" form and textContent collapses to just the glyph because
 *   the trailing label span doesn't render. But the *true* branch — driven
 *   by the `cards-show-undo-count` localStorage flag (see
 *   `readShowUndoCount` at PlayPage.tsx ~line 207, key `LS_SHOW_UNDO_COUNT`
 *   at ~line 162) — has zero coverage. A regression that dropped the count
 *   from the aria-label, removed the trailing `<span>` entirely, or
 *   regressed the pluralization (e.g. "1 steps available") would slip past
 *   every existing PlayPage test.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - In `beforeEach`, *after* `localStorage.clear()`, set the
 *     "cards-show-undo-count" flag to "true" so the freshly-mounted
 *     PlayPage's `useState` initializer (which reads `readShowUndoCount()`
 *     synchronously) picks up the truthy branch.
 *   - Mount at `/play/:gameId`, click `start-game`, and assert:
 *       1. With undoStack empty (right after start), aria-label is exactly
 *          "Undo, 0 steps available" — pins the plural-"steps" form.
 *       2. The trailing `<span data-testid="play-undo-btn-label">` is
 *          present and reads "Undo (0)".
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
  const TEST_GAME_ID = "header-undo-count-label-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Undo Count Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo-count-label test.",
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

describe("PlayPage primary-toolbar undo button show-count branch (W948)", () => {
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
    // primary-toolbar undo button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-undo-btn");

    // Aria-label contract for the truthy branch — count-bearing form with
    // the plural "steps" (undoStack is empty right after start, so N=0).
    // A regression that dropped the count, miscounted, or singularized
    // "step" for N=0 would break here.
    expect(btn.getAttribute("aria-label")).toBe("Undo, 0 steps available");

    // The trailing visible label span only renders when showUndoCount is
    // true — its presence is the sighted-user signal that mirrors the
    // a11y count. Removing the conditional `<span>` block (~PlayPage.tsx
    // line 1978) would make this lookup throw.
    const label = screen.getByTestId("play-undo-btn-label");
    expect(label.textContent?.trim()).toBe("Undo (0)");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
