/**
 * Unit test for the PlayPage twitter:title meta tag (W937).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1664) mounts a `<PageHead>` with
 *     title={`Play ${plugin.title}`}
 *   PageHead.tsx then writes `<meta name="twitter:title" content="...">`
 *   into `document.head`, where the content is the title with the
 *   site suffix appended (" — Cards and Such") — `exact` is not set,
 *   so the suffix path runs. A regression that:
 *     - dropped the title prop from the PageHead call,
 *     - removed the `setMeta("twitter:title", fullTitle)` line,
 *     - swapped the suffix order or value,
 *     - or passed `exact` truthy from PlayPage,
 *   would silently break Twitter/X card previews while every other
 *   PlayPage test continued to pass (PageHead renders `null` and only
 *   mutates `document.head`).
 *
 * Strategy mirrors PlayPage.canonical.test.tsx:
 *   - Hoisted fixture plugin with a distinctive title so the assertion
 *     can compare the exact twitter:title content verbatim and rule
 *     out collisions with any default/fallback string.
 *   - Mount at `/play/:gameId` — the header (and its PageHead) renders
 *     in any phase, so we don't need to click `start-game`.
 *   - PageHead writes the meta tag inside a useEffect, so we await one
 *     microtask before reading the DOM.
 *   - Assert `meta[name='twitter:title']` exists and its `content`
 *     equals the exact expected string ("Play <title> — Cards and Such").
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The title is distinctive enough that no default/fallback string in the
// app could coincidentally satisfy the assertion.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "twitter-title-fixture";
  const TEST_TITLE = "W937 Twitter Title Sentinel Game";
  const TEST_DESCRIPTION = "Sentinel description for the W937 twitter:title test.";
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
  // Clear any twitter:title meta left over from a previous test in the
  // same jsdom worker — otherwise a stale tag could falsely satisfy the
  // assertion if PageHead's effect didn't actually run this time.
  document
    .querySelectorAll("meta[name='twitter:title']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage twitter:title meta tag (W937)", () => {
  it("writes `Play <plugin.title> — Cards and Such` into meta[name=twitter:title]", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // PageHead writes the meta tag inside a useEffect — flush
    // microtasks so the effect has run before we read document.head.
    await Promise.resolve();

    const meta = document.head.querySelector<HTMLMetaElement>(
      "meta[name='twitter:title']",
    );

    // Existence: PageHead must have mounted and run setMeta. A regression
    // that dropped the PageHead mount entirely would surface here as null.
    expect(meta).not.toBeNull();

    // Exact content: pins the "Play " prefix from PlayPage.tsx, the
    // interpolated plugin.title, AND the " — Cards and Such" suffix
    // appended by PageHead when `exact` is not set. A regression in
    // any of those three pieces would surface here.
    expect(meta?.getAttribute("content")).toBe(
      `Play ${hoisted.TEST_TITLE} — Cards and Such`,
    );
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
