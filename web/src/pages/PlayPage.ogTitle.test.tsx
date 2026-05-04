/**
 * Unit test for the PlayPage SEO og:title meta tag (W927).
 *
 * Observable behavior:
 *   PlayPage.tsx mounts a `<PageHead>` with
 *     title={`Play ${plugin.title}`}
 *   PageHead.tsx then computes
 *     fullTitle = exact ? title : `${title} — Cards and Such`
 *   and writes it into a `<meta property="og:title">` tag in
 *   `document.head` (PageHead.tsx line 32:
 *   `setProperty("og:title", fullTitle)`). W907 pinned the
 *   `document.title` half of this contract; this test pins the
 *   `og:title` half so a regression that, e.g., dropped the
 *   `setProperty("og:title", ...)` line while leaving `document.title`
 *   intact would still be caught.
 *
 * Strategy mirrors PlayPage.ogUrl.test.tsx (W921):
 *   - Hoisted fixture plugin with a literal title so we can assert the
 *     exact og:title string verbatim, including the site suffix.
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
// The title is a literal sentinel so the assertion can compare the
// og:title string verbatim, including the " — Cards and Such" suffix
// that PageHead appends.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "test-game";
  const TEST_TITLE = "Og Title Fixture Game";
  const TEST_DESCRIPTION = "Sentinel description for the W927 og:title test.";
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
  // Clear any og:title meta left by a previous test in the same jsdom
  // worker, otherwise a stale tag could falsely satisfy the assertion
  // if PageHead's effect didn't actually run.
  document
    .querySelectorAll("meta[property='og:title']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage SEO og:title meta tag (W927)", () => {
  it("writes `Play <title> — Cards and Such` into <meta property=\"og:title\">", async () => {
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

    const ogTitle = document.head.querySelector<HTMLMetaElement>(
      "meta[property='og:title']",
    );

    // Existence: PageHead must have mounted and run its effect. A
    // regression that dropped the `setProperty("og:title", ...)` call
    // would surface here as a null tag.
    expect(ogTitle).not.toBeNull();

    // Exact content: pins both the `Play ${plugin.title}` interpolation
    // in PlayPage.tsx AND the " — Cards and Such" suffix appended by
    // PageHead when `exact` is not set.
    expect(ogTitle?.getAttribute("content")).toBe(
      `Play ${hoisted.TEST_TITLE} — Cards and Such`,
    );
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
