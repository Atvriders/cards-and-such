/**
 * Unit test for the PlayPage primary-toolbar restart button's lack of an
 * explicit `draggable` attribute (W2381).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2041) renders the restart button as
 *   `<button data-testid="play-restart-btn">` with explicit attributes for
 *   `type`, `className`, `onClick`, `title`, `aria-label`, and
 *   `data-tooltip` — but deliberately NO `draggable` attribute. The
 *   restart button is a click-only toolbar control; surfacing native HTML5
 *   drag semantics on it would be misleading (it is not a drag source) and
 *   on touch platforms can silently interfere with click activation. The
 *   sibling W2372 test pins the same contract on the hint button, but no
 *   existing PlayPage test pins it on the restart button, so a refactor
 *   that drops in `draggable={true}` (e.g. mistaken copy from a card-drag
 *   experiment) or `draggable="false"` (cosmetic noise that contradicts
 *   the implicit default) would slip past all current coverage of this
 *   button.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly,
 *     mirroring the W2372 (hint-btn no-draggable) and related
 *     restart-button-absence tests (NoId / NoStyle / NoTabindex) in this
 *     directory.
 *   - Mount at `/play/:gameId`, click `start-game` to advance past the
 *     setup screen so phase === "playing" and the restart button mounts,
 *     then look up the restart button by its testid and assert
 *     `btn.hasAttribute("draggable")` is false. `hasAttribute` is the
 *     precise contract — the DOM property `draggable` reflects an
 *     auto/inherited default for elements without an explicit attribute,
 *     so a property check would miss a drive-by `draggable={false}`.
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
  const TEST_GAME_ID = "restart-btn-no-draggable-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Restart Btn No Draggable Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the restart-btn-no-draggable test.",
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

describe("PlayPage primary-toolbar restart button has no draggable attribute (W2381)", () => {
  it("does not render a `draggable` attribute on the restart button so the implicit non-draggable default for a click-only toolbar control stays authoritative", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar restart button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn") as HTMLButtonElement;

    // Precise contract — `hasAttribute("draggable")` returns false iff no
    // `draggable` attribute is present in the rendered DOM. The DOM
    // property `draggable` returns `false` for elements without an
    // explicit attribute too, so a property check would miss a drive-by
    // `draggable={false}` regression. A refactor that slipped in any
    // explicit draggable value would flip this to true and fail loudly.
    expect(btn.hasAttribute("draggable")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
