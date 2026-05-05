/**
 * Unit test for the PlayPage primary-toolbar hint button's lack of an
 * `id` attribute (W2047).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2028) renders the hint button as
 *   `<button data-testid="play-hint-btn">` with explicit attributes for
 *   `type`, `className`, `onClick`, `disabled`, `title`, `aria-label`, and
 *   `data-tooltip` — but deliberately NO `id` attribute. The button is
 *   uniquely addressable via `data-testid` (tests) and `data-tooltip`
 *   (CSS tooltip styling), so an `id` would be redundant. More
 *   importantly, since multiple hint surfaces could in principle render
 *   in the same document tree (e.g. setup + playing phases overlap during
 *   transitions, or a future split-pane UI), introducing an `id="play-hint-btn"`
 *   would risk duplicate-id violations of the HTML spec — a real
 *   accessibility / DOM-uniqueness regression. No existing PlayPage test
 *   pins this absence, so a refactor that drops in `id="play-hint-btn"`
 *   for "convenience" would slip past all current coverage.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - `hintsEnabled` defaults to true (PlayPage.tsx ~line 185), so no LS
 *     setup is needed for the button to render.
 *   - Mount at `/play/:gameId`, click `start-game`, then look up the
 *     hint button by its testid and assert `btn.hasAttribute("id")` is
 *     false. A simple `id` getter check would coerce `null` → `""`
 *     loosely, so `hasAttribute` is the precise contract.
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
  const TEST_GAME_ID = "hint-button-no-id-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint Button No Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the hint-button-no-id test.",
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
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage primary-toolbar hint button has no id attribute (W2047)", () => {
  it("does not render an `id` attribute on the hint button so duplicate-id risk is avoided and the testid/tooltip selectors stay the canonical hooks", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar hint button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn") as HTMLButtonElement;

    // Precise contract — `hasAttribute("id")` returns false iff no `id`
    // attribute is present in the rendered DOM. A drive-by refactor that
    // slipped in `id="play-hint-btn"` (matching the testid name out of
    // habit) would flip this to true and fail loudly.
    expect(btn.hasAttribute("id")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
