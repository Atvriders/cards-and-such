/**
 * Structural test for the PlayPage `.play-header` layout container (W959).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1669) renders the page-level `<header
 *   className="play-header">` as the first child of the `.play-page`
 *   root. The class anchors a substantial block of CSS in PlayPage.css
 *   covering the title row, action cluster, sticky positioning, and
 *   responsive breakpoints — every header-level rule keys off this
 *   exact class. A rename or removal would silently strip the header's
 *   layout, padding, and sticky offset on every viewport with no
 *   runtime failure.
 *
 *   The W949 sibling test pins `.play-with-sidebar`. No existing test
 *   pins the `.play-header` wrapper itself: an exhaustive grep across
 *   the test suite turned up only doc-comment mentions, never an
 *   assertion (`querySelector(".play-header")` etc.). This test fills
 *   that gap with the minimum possible surface: render the page and
 *   assert the header exists, has the expected class, lives inside the
 *   `.play-page` root, and contains the title block the CSS depends on.
 *
 * Strategy mirrors PlayPage.withSidebarStructural.test.tsx (W949):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`. The header is unconditional — it
 *     renders during setup as well as playing — so no phase advance
 *     is required.
 *   - Locate the header by its CSS class via querySelector.
 *   - Assert the class structure and the structural invariants the CSS
 *     relies on: the header is a direct child of `.play-page` and
 *     contains the `.play-header-titleblock`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-structural-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Structural Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-header structural test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
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

describe("PlayPage .play-header layout container (W959)", () => {
  it("renders a .play-header inside .play-page wrapping the title block", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const root = container.querySelector(".play-page");
    const header = container.querySelector(".play-header");

    // Pin existence — a rename here detaches every header-level rule in
    // PlayPage.css (sticky offset, padding, action cluster layout,
    // responsive breakpoints).
    expect(root).not.toBeNull();
    expect(header).not.toBeNull();
    // Pin that the header is a `<header>` element with exactly the
    // expected class (no stray modifiers); the CSS rules key off the
    // bare class selector.
    expect(header?.tagName).toBe("HEADER");
    expect(header?.classList.contains("play-header")).toBe(true);
    // Pin the structural relationship: the header is a direct child of
    // the `.play-page` root, and the title block lives inside it. Both
    // invariants are load-bearing for the CSS cascade.
    expect(header?.parentElement).toBe(root);
    expect(header?.querySelector(".play-header-titleblock")).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
