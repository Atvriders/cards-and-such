/**
 * Unit test for the PlayPage primary-toolbar undo button's lack of an
 * inline `style` attribute (W2152).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1964) renders the undo button as
 *   `<button data-testid="play-undo-btn">` with explicit attributes for
 *   `type`, `className`, `onClick`, `disabled`, `title`, `aria-label`,
 *   `aria-keyshortcuts`, and `data-tooltip` — but deliberately NO inline
 *   `style` attribute. All visual styling for the button flows through
 *   the shared `play-iconbtn` and per-button `play-undo-btn` CSS classes
 *   so that themes, hover/focus states, and the disabled treatment stay
 *   centralized in stylesheets. (The inner glyph `<span>` does carry an
 *   inline style — that contract is pinned by PlayPageRedoGlyphStyle —
 *   but the button element itself must not.)
 *
 *   A refactor that "quickly" drops in `style={{ ... }}` on the button
 *   (e.g. an inline override during a layout tweak) would silently bypass
 *   the cascade and create a specificity / theming regression. No
 *   existing PlayPage test pins the absence of an inline `style` on the
 *   undo button, so such a change would slip past coverage.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter
 *     `phase === "playing"`, then look up the undo button by its testid
 *     and assert `btn.hasAttribute("style")` is false. Using
 *     `hasAttribute` (rather than reading `btn.style.cssText`) makes the
 *     assertion match the *attribute* contract: jsdom/React only emit a
 *     `style` attribute when the JSX prop is supplied, and an absent
 *     attribute is the precise observable we want to lock in.
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
  const TEST_GAME_ID = "undo-button-no-style-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Undo Button No Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo-button-no-style test.",
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

describe("PlayPage primary-toolbar undo button has no inline style attribute (W2152)", () => {
  it("does not render an inline `style` attribute on the undo button so visual styling stays in the play-iconbtn / play-undo-btn CSS classes", async () => {
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

    // Precise contract — `hasAttribute("style")` returns false iff no
    // `style` attribute is present in the rendered DOM. A drive-by
    // refactor that slipped in `style={{ ... }}` on the button (rather
    // than routing the rule through the shared CSS classes) would flip
    // this to true and fail loudly.
    expect(btn.hasAttribute("style")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
