/**
 * Unit test for the PlayPage primary-toolbar undo button's lack of an
 * explicit `role` attribute (W2376).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1964) renders the undo button as a native
 *   `<button data-testid="play-undo-btn">`. Because it is a real
 *   `<button>` element, the implicit ARIA role is already `"button"`,
 *   so an explicit `role="button"` (or any other role) would be
 *   redundant at best and an accessibility regression at worst —
 *   redundant `role="button"` on a native button is flagged by
 *   eslint-plugin-jsx-a11y / axe rules (`no-redundant-roles`), and a
 *   role override like `role="link"` would silently corrupt assistive-
 *   technology semantics.
 *
 *   No existing PlayPage test pins the absence of `role`, so a refactor
 *   that "just adds role='button' for clarity" — or worse, a copy-paste
 *   that lands `role="presentation"` here — would slip past coverage.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the games registry resolves.
 *   - Mount PlayPage at `/play/:gameId`, click `start-game` to enter
 *     `phase === "playing"`, then look up the undo button by testid
 *     and assert `btn.hasAttribute("role")` is false. `hasAttribute`
 *     is the precise contract — a `getAttribute` check would coerce
 *     `null` → empty-string comparisons loosely.
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
  const TEST_GAME_ID = "undo-button-no-role-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Undo Button No Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo-button-no-role test.",
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

describe("PlayPage primary-toolbar undo button has no role attribute (W2376)", () => {
  it("does not render an explicit `role` attribute on the undo button so the native <button> implicit role is preserved and no-redundant-roles / role-corruption regressions are caught", async () => {
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

    const btn = screen.getByTestId("play-undo-btn") as HTMLButtonElement;

    // Sanity: it really is a native <button>, so the implicit role is
    // already "button" — no explicit `role` attribute is needed.
    expect(btn.tagName).toBe("BUTTON");

    // Precise contract — `hasAttribute("role")` returns false iff no
    // `role` attribute is present in the rendered DOM. A drive-by
    // refactor that slipped in `role="button"` (redundant) or
    // `role="link"` (corrupting) would flip this to true and fail.
    expect(btn.hasAttribute("role")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
