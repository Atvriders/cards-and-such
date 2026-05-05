/**
 * Unit test for the PlayPage main heading (W2235).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1673) renders the per-game `<h1>` as the bare
 *   element `<h1>{plugin.title}</h1>` inside `<header className="play-header">`.
 *   It carries no `tabindex` attribute. This is load-bearing: a native
 *   `<h1>` is implicitly NOT in the sequential focus order, which is
 *   the correct accessibility default for static page titles. Adding
 *   `tabindex="0"` would inject a screen-reader-confusing tab stop
 *   on every page navigation; adding `tabindex="-1"` (without a
 *   programmatic `.focus()` call) is dead weight that misleads
 *   future authors into thinking the heading is a focus target.
 *
 *   No existing PlayPage*.test.tsx pins the absence of `tabindex` on
 *   the h1 — every existing tabindex-related test covers the info
 *   popover or the settings modal, never the heading. A regression
 *   that bolted `tabIndex={0}` or `tabIndex={-1}` onto the heading
 *   would silently change the focus-order contract while every other
 *   test continued to pass.
 *
 * Strategy mirrors PlayPage.canonical.test.tsx:
 *   - Hoisted fixture plugin so the registry is deterministic and the
 *     h1 receives a known title string.
 *   - Mount at `/play/:gameId`. The header (and its h1) renders in any
 *     phase, so no click on `start-game` is needed.
 *   - Read the live `<h1>` from the rendered DOM and assert
 *     `hasAttribute("tabindex") === false`. Using `hasAttribute` (not
 *     `getAttribute(...) === null`) makes the assertion attribute-name
 *     case-insensitive in HTML, which matches how React serialises
 *     `tabIndex` to the DOM as the lower-case `tabindex` attribute.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "h1-tabindex-fixture-game";
  const TEST_TITLE = "H1 Tabindex Fixture Game";
  const TEST_DESCRIPTION = "Sentinel description for the W2235 h1 tabindex test.";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: TEST_DESCRIPTION,
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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

describe("PlayPage main heading (W2235)", () => {
  it("renders the <h1> WITHOUT a `tabindex` attribute", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const h1 = container.querySelector("h1");

    // Existence sanity: the header renders unconditionally, so a null
    // h1 means PlayPage rendered an unrelated layout (e.g. the
    // not-found branch) and the assertion below would be vacuous.
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe(hoisted.TEST_TITLE);

    // Load-bearing assertion: the heading must NOT carry a tabindex.
    // hasAttribute is HTML-case-insensitive, so it catches both
    // `tabindex` (HTML) and `tabIndex` (React JSX) regressions.
    expect(h1?.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
