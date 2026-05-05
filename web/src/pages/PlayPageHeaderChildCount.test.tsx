/**
 * Pin test for the PlayPage `.play-header` element's exact direct-child
 * count (W1947).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1669) renders `<header className="play-header">`
 *   containing exactly two direct child elements regardless of game
 *   phase: the `.play-header-titleblock` (line 1670) and the
 *   `.play-header-actions` cluster (line 1786). Every other header
 *   element — the title row's category badge, h1, info button, the
 *   timer, pause button, seed picker, primary/secondary toolbar groups,
 *   the back-to-lobby Link — lives nested inside one of those two
 *   wrappers. The CSS cascade for the header (flex layout, gap, sticky
 *   offset, responsive collapse) keys off this two-column structure;
 *   accidentally adding a third sibling at the header root would break
 *   the layout silently.
 *
 *   Existing tests (PlayPage.headerStructural — W959,
 *   PlayPageToolbarActionsClass — W1300) pin the existence of the
 *   header and individual children, but none asserts the exact direct
 *   `childElementCount`. A rename refactor that promoted, demoted, or
 *   added a sibling at the header root would slip past the current
 *   suite.
 *
 * Strategy mirrors PlayPage.headerStructural.test.tsx (W959):
 *   - Hoisted minimal fixture plugin: no game logic, no canvas, no RNG.
 *   - Mount at `/play/:gameId` with a deterministic seed; the page
 *     stays in "setup" phase, which still renders the unconditional
 *     header wrappers.
 *   - Locate the header via `.play-header` and assert
 *     `childElementCount === 2`. Also pin the identities of the two
 *     children so a same-count swap (e.g. removing actions and adding
 *     a different sibling) still fails.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-childcount-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header ChildCount Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-header childElementCount test.",
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

describe("PlayPage .play-header childElementCount (W1947)", () => {
  it("renders exactly two direct children: titleblock and actions", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const header = container.querySelector(".play-header");
    expect(header).not.toBeNull();
    expect(header?.tagName).toBe("HEADER");

    // Pin the exact count. The header has two direct child elements
    // — the title block and the action cluster — and the CSS layout
    // depends on that two-column shape.
    expect(header!.childElementCount).toBe(2);

    // Pin the identities of the two children so a same-count swap
    // (e.g. demoting `.play-header-actions` and promoting some new
    // sibling) still fails.
    const children = Array.from(header!.children);
    expect(children[0]?.classList.contains("play-header-titleblock")).toBe(true);
    expect(children[1]?.classList.contains("play-header-actions")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
