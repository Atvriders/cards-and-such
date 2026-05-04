/**
 * Unit test for the PlayPage Twitter card description meta tag (W938).
 *
 * Observable behavior:
 *   PlayPage.tsx mounts a `<PageHead>` with
 *     description={`Play ${plugin.title} free online — ${plugin.description}`}
 *   PageHead.tsx then mirrors that string into
 *   `<meta name="twitter:description">` inside `document.head` (alongside
 *   `description` and `og:description`). The Twitter-specific tag is what
 *   X / Twitter previews scrape when the per-game URL is shared, so a
 *   regression that:
 *     - dropped the `setMeta("twitter:description", desc)` call from
 *       PageHead,
 *     - dropped the description prop from the PageHead invocation
 *       (causing PageHead to fall back to its DEFAULT_DESCRIPTION), or
 *     - removed the PageHead mount entirely,
 *   would silently degrade Twitter share previews while every in-body
 *   PlayPage test continued to pass (PageHead renders `null` and only
 *   mutates `document.head`).
 *
 * Strategy mirrors PlayPage.metaDescription.test.tsx (W898):
 *   - Hoisted fixture plugin with a deliberately distinctive
 *     `description` sentinel so we can match it exactly inside the meta
 *     content without false positives from sibling site copy.
 *   - Mount at `/play/:gameId` — the header (and its PageHead) renders
 *     in any phase, so we don't need to click `start-game`.
 *   - PageHead writes meta tags inside a useEffect, so we wait one
 *     microtask before reading the DOM. React's act() inside render()
 *     should already flush effects, but the explicit await keeps the
 *     assertion robust against scheduling tweaks.
 *   - Assert `<meta name="twitter:description">` content equals the
 *     exact interpolated string `Play <title> free online — <desc>`.
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
  const TEST_GAME_ID = "twitter-description-fixture";
  const TEST_TITLE = "Twitter Description Fixture Game";
  const TEST_DESCRIPTION =
    "A distinctive sentinel description for the W938 twitter:description meta-tag test.";
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
  // Clear any twitter:description left by a previous test in the same
  // jsdom worker, otherwise a stale tag could falsely satisfy the
  // assertion if PageHead's effect didn't actually run.
  document
    .querySelectorAll("meta[name='twitter:description']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage Twitter card description (W938)", () => {
  it("writes `Play <title> free online — <description>` into <meta name=\"twitter:description\">", async () => {
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

    const meta = document.head.querySelector<HTMLMetaElement>(
      "meta[name='twitter:description']",
    );

    // Existence: PageHead must have mounted and run its effect. A
    // regression that removed the PageHead call from PlayPage entirely,
    // or removed the setMeta("twitter:description", …) line from
    // PageHead, would surface here (no tag at all in document.head).
    expect(meta).not.toBeNull();

    // Exact content: pins both the prefix template (`Play … free
    // online — `) AND the interpolated `plugin.description`. A
    // regression that dropped the description prop (causing PageHead
    // to fall back to its site-wide DEFAULT_DESCRIPTION) would surface
    // here.
    expect(meta?.getAttribute("content")).toBe(expected);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
