/**
 * Unit test for the PlayPage SEO meta description (W898).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1666) mounts a `<PageHead>` with
 *     description={`Play ${plugin.title} free online — ${plugin.description}`}
 *   PageHead.tsx then writes that string into `<meta name="description">`,
 *   `<meta property="og:description">`, and `<meta name="twitter:description">`
 *   inside `document.head`. The interpolated `plugin.description` is the
 *   load-bearing piece — it differentiates the per-game SEO description
 *   from the site-wide default. No existing PlayPage test pins this
 *   contract; a regression that:
 *     - swapped `plugin.description` for `plugin.title`,
 *     - dropped the description prop from the PageHead call (causing
 *       PageHead to fall back to its DEFAULT_DESCRIPTION),
 *     - or removed the PageHead mount entirely,
 *   would silently break per-game discoverability while every
 *   in-body PlayPage test continued to pass (PageHead renders `null`
 *   and only mutates `document.head`).
 *
 * Strategy mirrors PlayPage.headerTitle.test.tsx:
 *   - Hoisted fixture plugin with a deliberately distinctive
 *     `description` string so we can match it exactly inside the meta
 *     content without false positives from any sibling site copy.
 *   - Mount at `/play/:gameId` — the header (and its PageHead) renders
 *     in any phase, so we don't need to click `start-game`.
 *   - PageHead writes meta tags inside an effect, so we wait one
 *     microtask via `await Promise.resolve()` before reading the DOM.
 *     React's act() automatically flushes the effect, but the explicit
 *     await keeps the assertion robust to scheduling tweaks.
 *   - Assert the `<meta name="description">` content equals the exact
 *     interpolated string `Play <title> free online — <description>`.
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
  const TEST_GAME_ID = "meta-description-fixture";
  const TEST_TITLE = "Meta Description Fixture Game";
  const TEST_DESCRIPTION =
    "A distinctive sentinel description for the W898 meta-description test.";
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
  // Clear any meta description left by a previous test in the same
  // jsdom worker, otherwise a stale tag could falsely satisfy the
  // assertion if PageHead's effect didn't actually run.
  document
    .querySelectorAll("meta[name='description']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage SEO meta description (W898)", () => {
  it("writes `Play <title> free online — <description>` into <meta name=\"description\">", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // PageHead writes meta tags inside a useEffect — flush microtasks
    // so the effect has run before we read document.head. React's act
    // wrapper inside render() should already flush effects synchronously
    // in jsdom, but the explicit await keeps the assertion stable
    // against scheduling changes.
    await Promise.resolve();

    const expected = `Play ${hoisted.TEST_TITLE} free online — ${hoisted.TEST_DESCRIPTION}`;

    const meta = document.querySelector<HTMLMetaElement>(
      "meta[name='description']",
    );

    // Existence: PageHead must have mounted and run its effect. A
    // regression that removed the PageHead call from PlayPage entirely
    // would surface here (no meta tag at all in document.head).
    expect(meta).not.toBeNull();

    // Exact content: pins both the prefix template (`Play … free
    // online — `) AND the interpolated `plugin.description`. A
    // regression that swapped `plugin.description` for `plugin.title`,
    // or dropped the description prop (causing PageHead to fall back
    // to its site-wide DEFAULT_DESCRIPTION), would surface here.
    expect(meta?.getAttribute("content")).toBe(expected);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
