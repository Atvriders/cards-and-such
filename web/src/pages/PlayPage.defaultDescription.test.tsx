/**
 * Unit test for the PlayPage default-description fallback (W942).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 483) renders `<PageHead title="Game not found" />`
 *   on the unknown-gameId branch — note the *missing* `description`
 *   prop. PageHead.tsx (~line 30) then falls back to its module-level
 *   constant DEFAULT_DESCRIPTION when no description is supplied:
 *
 *     const desc = description ?? DEFAULT_DESCRIPTION;
 *     setMeta("description", desc);
 *
 *   where DEFAULT_DESCRIPTION is:
 *     "Cards and Such is a free in-browser game catalog with 4,500+
 *      solitaire, card, dice, board, and arcade games."
 *
 *   No sibling test pins this branch — every other PlayPage *Head* test
 *   exercises the happy path where PlayPage passes a fully-formed
 *   `Play <plugin.title> free online — <plugin.description>` string,
 *   which masks any regression in the `??` operand. A regression that:
 *     - dropped the `?? DEFAULT_DESCRIPTION` half of the coalesce
 *       (resulting in `meta[name=description]` content="undefined"),
 *     - changed DEFAULT_DESCRIPTION's wording (silently shipping a
 *       different SEO blurb to every not-found / minimally-mounted
 *       page on the site),
 *     - or stopped writing meta[name=description] entirely when the
 *       prop was omitted,
 *   would silently break crawler previews for the dead-end recovery
 *   page (and any future PageHead caller that intentionally omits
 *   description to inherit the site default).
 *
 * Strategy:
 *   - Mock the registry with a decoy plugin whose id doesn't match the
 *     mounted route, forcing PlayPage onto the not-found branch where
 *     PageHead is invoked *without* a description prop. This is the only
 *     in-tree caller exercising the fallback path.
 *   - Clear any meta[name=description] left by a previous test in the
 *     same jsdom worker so a stale tag can't false-positive the assertion.
 *   - PageHead writes the meta tag inside a useEffect — flush microtasks
 *     before reading document.head.
 *   - Assert the meta tag exists AND its content equals the exact
 *     DEFAULT_DESCRIPTION string verbatim. Pinning the full string (not
 *     a substring) catches accidental wording drift in addition to the
 *     fallback-path regression.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — a decoy plugin whose id deliberately doesn't match
// the path we mount at, guaranteeing PlayPage falls through to the
// unknown-gameId branch (and thus to the description-less PageHead call)
// regardless of what the real registry currently contains.
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
    UNKNOWN_ID: "w942-default-description-fixture",
    // Verbatim copy of DEFAULT_DESCRIPTION from web/src/platform/PageHead.tsx.
    // Kept inline (not imported) so a regression that silently changes
    // PageHead's constant to drift from the reviewed wording surfaces here
    // as a test failure rather than a coordinated rename.
    DEFAULT_DESCRIPTION:
      "Cards and Such is a free in-browser game catalog with 4,500+ solitaire, card, dice, board, and arcade games.",
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
  // Clear any meta[name=description] left over from a previous test in
  // the same jsdom worker — otherwise a stale tag (potentially with the
  // happy-path content) could falsely satisfy the assertion if PageHead's
  // effect didn't actually run this time.
  document
    .querySelectorAll("meta[name='description']")
    .forEach((el) => el.remove());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage default description fallback (W942)", () => {
  it("writes DEFAULT_DESCRIPTION into meta[name=description] when PageHead is mounted without a description prop", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.UNKNOWN_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // PageHead writes the meta tag inside a useEffect — flush
    // microtasks so the effect has run before we read document.head.
    await Promise.resolve();

    const meta = document.head.querySelector<HTMLMetaElement>(
      "meta[name='description']",
    );

    // Existence: PageHead must have mounted and run setMeta. A regression
    // that dropped the PageHead mount from the not-found branch entirely,
    // or that stopped writing meta[name=description] when the prop is
    // omitted, would surface here as null.
    expect(meta).not.toBeNull();

    // Exact content: pins the `?? DEFAULT_DESCRIPTION` fallback path AND
    // the exact wording of the constant. Substring matching would let a
    // partial regression slip (e.g. "4,500" -> "4500" silently breaks
    // SEO copy review) — full equality forces a deliberate update.
    expect(meta?.getAttribute("content")).toBe(hoisted.DEFAULT_DESCRIPTION);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
