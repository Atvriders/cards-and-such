/**
 * Unit test for the PlayPage header back-to-lobby link's inner glyph
 * `aria-hidden` contract (W1392).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2205) renders the back link as
 *     <Link className="play-backbtn" title="Back to lobby" aria-label="Back to lobby">
 *       <svg ... aria-hidden="true" focusable="false">...</svg>
 *       <span>{t("nav.lobby")}</span>
 *     </Link>
 *
 *   The inline `<svg>` is purely decorative — the link already exposes its
 *   accessible name via `aria-label`, and the visible label text inside the
 *   adjacent `<span>` repeats the meaning. If the glyph were missing
 *   `aria-hidden="true"`, screen readers would announce the SVG's element
 *   tree (or even the raw `<line>`/`<polyline>` children on some
 *   AT/browser combos), polluting the back link's announcement and
 *   potentially producing a duplicate or noisy reading like
 *   "Back to lobby, image, Lobby".
 *
 *   Sibling test W1386 (PlayPage.headerBackLinkTitle.test.tsx) pins the
 *   native `title` on the same link, but explicitly excludes the inner
 *   glyph from its scope. No existing test asserts the glyph's
 *   `aria-hidden` attribute, so a regression that dropped it (e.g. a
 *   refactor swapping the inline SVG for an icon component that forgets to
 *   set aria-hidden) would be silently invisible to every other test.
 *
 * Strategy mirrors W1386 — mount with a minimal hoisted plugin, locate the
 * back link by its stable `.play-backbtn` class, then assert the inner
 * `<svg>` element exposes `aria-hidden="true"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — minimal valid plugin so the registry lookup succeeds
// and PlayPage renders the header (which includes the back link in every
// phase, including the initial setup screen).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "back-btn-glyph-aria-hidden-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Back Btn Glyph Aria Hidden Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the back-to-lobby link inner glyph aria-hidden test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header back-to-lobby link inner glyph aria-hidden contract (W1392)", () => {
  it("hides the decorative arrow SVG from assistive tech via aria-hidden='true' so screen readers announce only the link's accessible name", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Locate the back link by its stable structural class. The back link
    // is the only `.play-backbtn` element on the page; querying by class
    // (rather than role/name) sidesteps any conflict with the duplicate
    // "Back to lobby" link rendered by the unknown-game fallback in a
    // different render path.
    const back = container.querySelector(".play-backbtn") as HTMLAnchorElement | null;
    expect(back).not.toBeNull();

    // The decorative arrow glyph is the link's first inline `<svg>` child.
    // It must expose `aria-hidden="true"` so the link's accessible name is
    // sourced solely from `aria-label`/visible text and never polluted by
    // the SVG element tree.
    const glyph = back!.querySelector("svg");
    expect(glyph).not.toBeNull();
    expect(glyph!.getAttribute("aria-hidden")).toBe("true");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
