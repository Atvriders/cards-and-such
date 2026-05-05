/**
 * Unit test for the PlayPage primary-toolbar hint button's lack of an
 * inline `style` attribute (W2150).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2028) renders the hint button as
 *   `<button data-testid="play-hint-btn">` with explicit attributes for
 *   `type`, `className`, `onClick`, `disabled`, `title`, `aria-label`, and
 *   `data-tooltip` — but deliberately NO inline `style` prop. All visual
 *   styling for the hint button is delegated to the `play-iconbtn` and
 *   `play-hint-btn` CSS classes, which keeps the toolbar visually
 *   consistent with sibling iconbar buttons (Restart, Undo, Redo) and
 *   keeps the look themable via stylesheet, not JS-driven inline rules.
 *   No existing PlayPage test pins this absence, so a refactor that
 *   slipped an inline `style={{ ... }}` onto the hint button (e.g. a
 *   one-off color override or a width tweak during a layout experiment)
 *   would slip past all current coverage and silently break theming.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - `hintsEnabled` defaults to true (PlayPage.tsx ~line 185), so no LS
 *     setup is needed for the button to render.
 *   - Mount at `/play/:gameId`, click `start-game`, then look up the
 *     hint button by its testid and assert `btn.hasAttribute("style")`
 *     is false. `hasAttribute` is the precise contract — reading
 *     `btn.style` returns a non-null `CSSStyleDeclaration` even when
 *     no inline style is set, so the attribute-presence check is the
 *     only reliable signal.
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
  const TEST_GAME_ID = "hint-button-no-style-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint Button No Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the hint-button-no-style test.",
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

describe("PlayPage primary-toolbar hint button has no inline style attribute (W2150)", () => {
  it("does not render an inline `style` attribute on the hint button so all visual styling stays in the `play-iconbtn`/`play-hint-btn` stylesheet hooks", async () => {
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

    // Precise contract — `hasAttribute("style")` returns false iff no
    // inline `style` attribute is present in the rendered DOM. Reading
    // `btn.style` itself would always return a `CSSStyleDeclaration`
    // (even an empty one), so attribute-presence is the only signal
    // that catches a drive-by `style={{ ... }}` regression.
    expect(btn.hasAttribute("style")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
