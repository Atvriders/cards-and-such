/**
 * Unit test for the PlayPage SEO canonical URL (W915).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1667) mounts a `<PageHead>` with
 *     canonical={`https://cards.waterburp.com/play/${plugin.id}`}
 *   PageHead.tsx then either creates or updates `<link rel="canonical">`
 *   in `document.head` and mirrors the same URL into
 *   `<meta property="og:url">`. The interpolated `plugin.id` is the
 *   load-bearing piece — it differentiates the per-game canonical URL
 *   from the lobby/site root. No existing PlayPage test pins this
 *   contract; a regression that:
 *     - dropped the canonical prop from the PageHead call (skipping
 *       the entire `if (canonical)` branch in PageHead),
 *     - hardcoded a different host or path prefix,
 *     - or swapped `plugin.id` for `plugin.title` in the URL,
 *   would silently break per-game SEO + duplicate-content handling
 *   while every in-body PlayPage test continued to pass (PageHead
 *   renders `null` and only mutates `document.head`).
 *
 * Strategy mirrors PlayPage.metaDescription.test.tsx:
 *   - Hoisted fixture plugin with the literal id "test-game" so we
 *     can assert the exact canonical URL string without interpolation
 *     ambiguity in the assertion.
 *   - Mount at `/play/:gameId` — the header (and its PageHead) renders
 *     in any phase, so we don't need to click `start-game`.
 *   - PageHead writes the link tag inside a useEffect, so we wait one
 *     microtask via `await Promise.resolve()` before reading the DOM.
 *   - Assert `link[rel='canonical']` exists and its `href` equals the
 *     exact expected URL.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The id is the literal "test-game" so the assertion can compare the
// canonical URL string verbatim.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "test-game";
  const TEST_TITLE = "Canonical Fixture Game";
  const TEST_DESCRIPTION = "Sentinel description for the W915 canonical test.";
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
  // Clear any canonical link left by a previous test in the same jsdom
  // worker, otherwise a stale tag could falsely satisfy the assertion
  // if PageHead's effect didn't actually run.
  document
    .querySelectorAll("link[rel='canonical']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage SEO canonical URL (W915)", () => {
  it("writes `https://cards.waterburp.com/play/<id>` into <link rel=\"canonical\">", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // PageHead writes the link tag inside a useEffect — flush
    // microtasks so the effect has run before we read document.head.
    await Promise.resolve();

    const link = document.head.querySelector<HTMLLinkElement>(
      "link[rel='canonical']",
    );

    // Existence: PageHead must have mounted and entered the
    // `if (canonical)` branch. A regression that dropped the canonical
    // prop from the PageHead call (or removed the PageHead mount
    // entirely) would surface here as a null link.
    expect(link).not.toBeNull();

    // Exact href: pins both the host (`https://cards.waterburp.com`),
    // the path prefix (`/play/`), AND the interpolated `plugin.id`.
    // A regression that hardcoded a different host, swapped the path
    // prefix, or used the wrong field for the slug would surface here.
    expect(link?.href).toBe("https://cards.waterburp.com/play/test-game");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
