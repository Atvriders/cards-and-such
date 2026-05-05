/**
 * Unit test for the PlayPage primary-toolbar hint button's lack of an
 * explicit `tabindex` attribute (W2289).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2010-2038) renders the hint button as
 *   `<button data-testid="play-hint-btn">` with explicit attributes for
 *   `type`, `className`, `onClick`, `disabled`, `title`, `aria-label`, and
 *   `data-tooltip` — but deliberately NO `tabindex` attribute. Native
 *   `<button>` elements are focusable by default and participate in the
 *   sequential keyboard navigation order automatically (DOM source order).
 *   Adding `tabindex="0"` would be redundant noise; adding `tabindex="-1"`
 *   would silently remove the hint button from keyboard tab order — a real
 *   accessibility regression for keyboard users who rely on Tab to reach
 *   the toolbar. No existing PlayPage test pins this absence, so a refactor
 *   that drops in `tabindex={...}` for either reason would slip past all
 *   current coverage.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - `hintsEnabled` defaults to true (PlayPage.tsx ~line 185), so no LS
 *     setup is needed for the button to render.
 *   - Mount at `/play/:gameId`, click `start-game`, then look up the
 *     hint button by its testid and assert `btn.hasAttribute("tabindex")`
 *     is false. `hasAttribute` is the precise contract — the property
 *     `tabIndex` always reflects a numeric default (0 for buttons), so
 *     property checks would not detect an explicit attribute.
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
  const TEST_GAME_ID = "hint-button-no-tabindex-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint Button No Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the hint-button-no-tabindex test.",
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

describe("PlayPage primary-toolbar hint button has no tabindex attribute (W2289)", () => {
  it("does not render a `tabindex` attribute on the hint button so the native button focusability and DOM-order tab sequence remain authoritative", async () => {
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

    // Precise contract — `hasAttribute("tabindex")` returns false iff no
    // `tabindex` attribute is present in the rendered DOM. The DOM
    // property `tabIndex` would coerce to 0 for native buttons even
    // without an explicit attribute, so a property check would miss a
    // drive-by `tabIndex={-1}` regression. A refactor that slipped in
    // any explicit tabindex value would flip this to true and fail loudly.
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
