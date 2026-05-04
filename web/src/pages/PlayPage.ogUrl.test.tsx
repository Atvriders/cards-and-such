/**
 * Unit test for the PlayPage SEO og:url meta tag (W921).
 *
 * Observable behavior:
 *   PlayPage.tsx mounts a `<PageHead>` with
 *     canonical={`https://cards.waterburp.com/play/${plugin.id}`}
 *   PageHead.tsx then mirrors the same URL into a
 *   `<meta property="og:url">` tag in `document.head` (PageHead.tsx
 *   line 45: `setProperty("og:url", canonical)`). W915 pinned the
 *   `<link rel="canonical">` half of this contract; this test pins the
 *   `og:url` half so a regression that, e.g., dropped the
 *   `setProperty("og:url", ...)` line while leaving the canonical link
 *   intact would still be caught.
 *
 * Strategy mirrors PlayPage.canonical.test.tsx (W915):
 *   - Hoisted fixture plugin with the literal id "test-game" so we can
 *     assert the exact og:url string verbatim.
 *   - Mount at `/play/:gameId` — the header (and its PageHead) renders
 *     in any phase, so we don't need to click `start-game`.
 *   - PageHead writes meta tags inside a useEffect, so we wait one
 *     microtask via `await Promise.resolve()` before reading the DOM.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The id is the literal "test-game" so the assertion can compare the
// og:url string verbatim.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "test-game";
  const TEST_TITLE = "Og:url Fixture Game";
  const TEST_DESCRIPTION = "Sentinel description for the W921 og:url test.";
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
  return { TEST_GAME_ID, fixturePlugin };
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
  // Clear any og:url meta left by a previous test in the same jsdom
  // worker, otherwise a stale tag could falsely satisfy the assertion
  // if PageHead's effect didn't actually run.
  document
    .querySelectorAll("meta[property='og:url']")
    .forEach((el) => el.remove());
  document
    .querySelectorAll("link[rel='canonical']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage SEO og:url meta tag (W921)", () => {
  it("writes `https://cards.waterburp.com/play/<id>` into <meta property=\"og:url\">", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // PageHead writes meta tags inside a useEffect — flush microtasks
    // so the effect has run before we read document.head.
    await Promise.resolve();

    const ogUrl = document.head.querySelector<HTMLMetaElement>(
      "meta[property='og:url']",
    );

    // Existence: PageHead must have mounted and entered the
    // `if (canonical)` branch. A regression that dropped the canonical
    // prop or removed the `setProperty("og:url", ...)` call would
    // surface here as a null tag.
    expect(ogUrl).not.toBeNull();

    // Exact content: pins host, path prefix, AND interpolated plugin.id.
    expect(ogUrl?.getAttribute("content")).toBe(
      "https://cards.waterburp.com/play/test-game",
    );
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
