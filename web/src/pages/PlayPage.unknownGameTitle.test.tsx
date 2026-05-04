/**
 * Unit test for the PlayPage unknown-gameId document.title fallback (W956).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 483) renders `<PageHead title="Game not found" />`
 *   on the unknown-gameId branch — note the *missing* `exact` prop.
 *   PageHead.tsx (~line 27) then composes the document title by
 *   appending the site suffix:
 *
 *     const fullTitle = exact ? title : `${title}${SITE_SUFFIX}`;
 *     document.title = fullTitle;
 *
 *   where SITE_SUFFIX is " — Cards and Such".
 *
 *   No sibling test pins this branch's *title* (W942 covers the
 *   description fallback on the same branch; W911 covers the visible
 *   "Unknown game: ..." text + recovery link, but not document.title).
 *   Every other PlayPage *Title* test mocks the registry with a valid
 *   plugin and follows the happy path through PlayGame, where the title
 *   is built from `plugin.title` — none exercise the literal
 *   "Game not found" branch. A regression that:
 *     - flipped `exact` to `true` on the not-found PageHead (shipping a
 *       bare "Game not found" tab title with no site context, hurting
 *       multi-tab discoverability and bookmarking),
 *     - changed the literal "Game not found" string to something else
 *       (silently breaking the only branded fallback users see when
 *       arriving at a stale URL),
 *     - or dropped the PageHead mount from the not-found branch entirely
 *       (leaving document.title showing whatever the previous SPA route
 *       set, e.g. the lobby title, which is misleading),
 *   would silently degrade UX for the dead-end recovery page.
 *
 * Strategy:
 *   - Mock the registry with a decoy plugin whose id doesn't match the
 *     mounted route, forcing PlayPage onto the not-found branch where
 *     PageHead is invoked with `title="Game not found"` and no `exact`
 *     prop. This is the only in-tree caller exercising that exact title.
 *   - Force `document.title` to a sentinel in `beforeEach` so a stale
 *     value left by a prior test in the same jsdom worker can't
 *     false-positive the assertion.
 *   - PageHead writes `document.title` inside a useEffect — flush
 *     microtasks before reading it.
 *   - Assert full equality (not substring) on the composed title so a
 *     regression that drops either operand of the template literal
 *     surfaces here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — a decoy plugin whose id deliberately doesn't match
// the path we mount at, guaranteeing PlayPage falls through to the
// unknown-gameId branch (and thus to the `title="Game not found"`
// PageHead call) regardless of what the real registry currently contains.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const decoyPlugin = {
    id: "some-other-real-game",
    title: "Decoy Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Decoy plugin so the registry isn't empty.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="decoy-game">decoy</div>,
  };
  return {
    decoyPlugin,
    UNKNOWN_ID: "w956-unknown-game-title-fixture",
    // Verbatim copy of the title literal at PlayPage.tsx:483 +
    // SITE_SUFFIX from PageHead.tsx:14. Kept inline (not imported) so a
    // regression that silently changes either constant surfaces here as
    // a test failure rather than a coordinated rename.
    EXPECTED_TITLE: "Game not found — Cards and Such",
    SENTINEL_TITLE: "w956-sentinel-must-be-overwritten",
  };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.decoyPlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free in case any code path imports it eagerly.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  // Force document.title to a sentinel so a stale value left by a prior
  // test in the same jsdom worker (or a regression that drops the
  // PageHead mount entirely from the not-found branch) can't satisfy
  // the assertion by accident.
  document.title = hoisted.SENTINEL_TITLE;
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage unknown-game document.title (W956)", () => {
  it("sets document.title to `Game not found — Cards and Such` on the unknown-gameId branch", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.UNKNOWN_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // PageHead writes document.title inside a useEffect — flush
    // microtasks so the effect has run before we read.
    await Promise.resolve();

    // Full equality pins both halves of the template literal:
    // the literal "Game not found" passed by PlayPage AND the
    // " — Cards and Such" suffix appended by PageHead. Substring
    // matching would let a regression that silently dropped either
    // half slip through.
    expect(document.title).toBe(hoisted.EXPECTED_TITLE);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
