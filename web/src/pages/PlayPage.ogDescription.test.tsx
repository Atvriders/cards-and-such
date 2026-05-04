/**
 * Unit test for the PlayPage SEO og:description meta tag (W936).
 *
 * Observable behavior:
 *   PlayPage.tsx mounts a `<PageHead>` with
 *     description={`Play ${plugin.title} free online — ${plugin.description}`}
 *   PageHead.tsx (line 33: `setProperty("og:description", desc)`) then
 *   writes that string into a `<meta property="og:description">` tag in
 *   `document.head`. W898 pinned the `<meta name="description">` half of
 *   this contract; W936 pins the `og:description` half so a regression
 *   that, e.g., dropped the `setProperty("og:description", ...)` line
 *   while leaving `<meta name="description">` intact would still be
 *   caught. og:description is the description shown in social-card
 *   previews (Facebook, LinkedIn, Discord, Slack), so silently breaking
 *   it would degrade share previews even when in-page SEO still passed.
 *
 * Strategy mirrors PlayPage.ogTitle.test.tsx (W927) and
 * PlayPage.metaDescription.test.tsx (W898):
 *   - Hoisted fixture plugin with a deliberately distinctive
 *     `description` string so we can match it exactly inside the meta
 *     content without false positives from any sibling site copy.
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
// The description string is intentionally distinctive (contains a phrase
// that won't appear anywhere else in the rendered output) so we can
// assert exact equality without false positives.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "og-description-fixture";
  const TEST_TITLE = "Og Description Fixture Game";
  const TEST_DESCRIPTION =
    "A distinctive sentinel description for the W936 og:description test.";
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
  return { TEST_GAME_ID, TEST_TITLE, TEST_DESCRIPTION, fixturePlugin };
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
  // Clear any og:description meta left by a previous test in the same
  // jsdom worker, otherwise a stale tag could falsely satisfy the
  // assertion if PageHead's effect didn't actually run.
  document
    .querySelectorAll("meta[property='og:description']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage SEO og:description meta tag (W936)", () => {
  it("writes `Play <title> free online — <description>` into <meta property=\"og:description\">", async () => {
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

    const expected = `Play ${hoisted.TEST_TITLE} free online — ${hoisted.TEST_DESCRIPTION}`;

    const ogDesc = document.head.querySelector<HTMLMetaElement>(
      "meta[property='og:description']",
    );

    // Existence: PageHead must have mounted and run its effect. A
    // regression that dropped the `setProperty("og:description", ...)`
    // call would surface here as a null tag.
    expect(ogDesc).not.toBeNull();

    // Exact content: pins both the prefix template (`Play … free
    // online — `) AND the interpolated `plugin.description`. A regression
    // that dropped the description prop (causing PageHead to fall back
    // to its site-wide DEFAULT_DESCRIPTION), or swapped `plugin.description`
    // for `plugin.title`, would surface here.
    expect(ogDesc?.getAttribute("content")).toBe(expected);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
