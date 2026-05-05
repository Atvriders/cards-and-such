/**
 * Pin test for the PlayPage `.play-header-titleblock` element's exact
 * `tagName` and `className` (W1955).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1670) renders `<div className="play-header-titleblock">`
 *   as the first direct child of `<header className="play-header">`. The
 *   element is a plain DIV (not a SECTION, HGROUP, or any semantic
 *   element) and its className is exactly "play-header-titleblock" with
 *   no additional modifier or layout classes.
 *
 *   The CSS that styles the header's left column (containing the
 *   category badge, h1, info button, popover) keys off this exact
 *   class string. A refactor that promoted the wrapper to a semantic
 *   element (e.g. <section>) or added a modifier class
 *   (e.g. "play-header-titleblock play-header-titleblock--compact")
 *   would silently break the CSS cascade or screen-reader heading
 *   structure.
 *
 *   Existing coverage (W1947 PlayPageHeaderChildCount) only checks
 *   `classList.contains("play-header-titleblock")`, which would still
 *   pass under both of those drift scenarios. The headerStructural
 *   test (W959) only pins the existence of the selector. Neither
 *   asserts exact `tagName` or exact `className` equality on the
 *   titleblock element itself.
 *
 * Strategy mirrors PlayPageHeaderChildCount.test.tsx:
 *   - Hoisted minimal fixture plugin: no game logic, no canvas.
 *   - Mount at `/play/:gameId` with a deterministic seed; the page
 *     stays in "setup" phase, which still renders the unconditional
 *     header titleblock.
 *   - Query `.play-header-titleblock` and assert both `tagName` and
 *     `className` exact-equality.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-titleblock-attr-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Titleblock Attr Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-header-titleblock attr test.",
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

describe("PlayPage .play-header-titleblock attr (W1955)", () => {
  it("is a DIV with className exactly 'play-header-titleblock'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const titleblock = container.querySelector(".play-header-titleblock");
    expect(titleblock).not.toBeNull();

    // Pin the exact tagName: a plain DIV, not a semantic element. A
    // refactor to <section> or <hgroup> would change the a11y tree
    // and break this assertion.
    expect(titleblock?.tagName).toBe("DIV");

    // Pin the exact className string: no modifier or layout classes.
    // Adding "play-header-titleblock--compact" or similar would break
    // this even though `classList.contains` would still pass.
    expect(titleblock?.className).toBe("play-header-titleblock");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
