/**
 * Unit test for the PlayPage browser tab title (W907).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1664) mounts a `<PageHead>` with
 *     title={`Play ${plugin.title}`}
 *   PageHead.tsx (`exact` is left undefined, so the default branch runs)
 *   then writes
 *     document.title = `Play ${plugin.title} — Cards and Such`
 *   inside its `useEffect`. That document title is what the browser tab
 *   and bookmarks display, and it is the load-bearing piece for users
 *   juggling multiple solitaire tabs.
 *
 *   The sibling W898 test (PlayPage.metaDescription.test.tsx) pins the
 *   `<meta name="description">` content but explicitly does NOT touch
 *   `document.title`. A regression that:
 *     - dropped the `Play ` prefix from PlayPage's PageHead title prop,
 *     - swapped `plugin.title` for `plugin.id`,
 *     - flipped `exact` to `true` (suppressing the site suffix),
 *     - or removed the PageHead mount entirely,
 *   would silently break tab labelling while every other PlayPage test
 *   continues to pass (PageHead renders `null` and only mutates
 *   `document.title` / `document.head`).
 *
 * Strategy mirrors PlayPage.metaDescription.test.tsx:
 *   - Hoisted fixture plugin with a deliberately distinctive `title`
 *     string so we can match it exactly inside `document.title` without
 *     false positives from any other rendered copy.
 *   - Mount at `/play/:gameId` — the header (and its PageHead) renders
 *     in any phase, so we don't need to click `start-game`.
 *   - PageHead writes `document.title` inside an effect, so we wait one
 *     microtask via `await Promise.resolve()` before reading. React's
 *     act() inside render() should already flush effects synchronously
 *     in jsdom, but the explicit await keeps the assertion robust.
 *   - Reset `document.title` in `beforeEach` to a sentinel so a stale
 *     title left by a previous test in the same jsdom worker cannot
 *     falsely satisfy the assertion.
 *   - Assert exact equality on the full `Play <title> — Cards and Such`
 *     string — pins both the prefix, the interpolated `plugin.title`,
 *     and the site-suffix branch of PageHead.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The title string is intentionally distinctive (contains a phrase that
// won't appear anywhere else in the rendered output or in any sibling
// game registry) so we can assert exact equality on document.title
// without false positives.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "page-title-fixture";
  const TEST_TITLE = "Page Title Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W907 page-title test.",
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

const SENTINEL_TITLE = "__pre-test-sentinel__";

beforeEach(() => {
  localStorage.clear();
  // Force document.title to a sentinel so a stale value left by a
  // previous test in the same jsdom worker cannot falsely satisfy the
  // assertion. If PageHead's effect doesn't actually run, the
  // assertion will see the sentinel and fail loudly.
  document.title = SENTINEL_TITLE;
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage browser tab title (W907)", () => {
  it("sets document.title to `Play <title> — Cards and Such`", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // PageHead writes document.title inside a useEffect — flush
    // microtasks so the effect has run before we read it. React's act
    // wrapper inside render() should already flush effects
    // synchronously in jsdom, but the explicit await keeps the
    // assertion stable against scheduling changes.
    await Promise.resolve();

    // Pins both the `Play ` prefix template, the interpolated
    // `plugin.title`, and the ` — Cards and Such` site suffix branch
    // of PageHead (the one taken when `exact` is omitted/false). A
    // regression in any of those three pieces surfaces here.
    const expected = `Play ${hoisted.TEST_TITLE} — Cards and Such`;
    expect(document.title).toBe(expected);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
