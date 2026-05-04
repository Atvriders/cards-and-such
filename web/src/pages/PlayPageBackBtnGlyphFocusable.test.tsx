/**
 * Unit test for the PlayPage header back-to-lobby link's inner glyph
 * `focusable="false"` contract (W1400).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2206) renders the back link's decorative arrow as
 *     <svg ... aria-hidden="true" focusable="false">...</svg>
 *
 *   Inline `<svg>` elements are focusable by default in legacy IE/Edge
 *   (Trident/EdgeHTML) and in any tab-walker that treats SVG as a
 *   focusable container. Without `focusable="false"` the keyboard tab
 *   sequence stops on the decorative glyph before the link itself,
 *   producing a confusing extra tab stop with no visible focus ring and
 *   no accessible name (the `<svg>` is `aria-hidden`).
 *
 *   Sibling test W1392 (PlayPageBackBtnGlyphAriaHidden) pins the glyph's
 *   `aria-hidden="true"`, but its scope explicitly excludes `focusable`.
 *   Sibling test W1264 (PlayPageFullscreenSvgFocusable) pins
 *   `focusable="false"` on a *different* SVG (the fullscreen toggle
 *   button glyph), not the back link's arrow. No existing test asserts
 *   `focusable="false"` on the back link's inner SVG, so a regression
 *   that dropped it (e.g. converting the inline SVG to an icon component
 *   that forgets to forward `focusable`) would be silently invisible.
 *
 * Strategy mirrors W1392 — mount with a minimal hoisted plugin, locate
 * the back link by its stable `.play-backbtn` class, then assert the
 * inner `<svg>` element exposes `focusable="false"`.
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
  const TEST_GAME_ID = "back-btn-glyph-focusable-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Back Btn Glyph Focusable Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the back-to-lobby link inner glyph focusable attr test.",
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

describe("PlayPage header back-to-lobby link inner glyph focusable contract (W1400)", () => {
  it("opts the decorative arrow SVG out of the keyboard tab sequence via focusable='false' so legacy engines don't insert a phantom tab stop before the link", async () => {
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
    // It must expose `focusable="false"` so legacy IE/Edge engines (and
    // any aggressive tab-walker) skip it during keyboard navigation —
    // the link itself remains the single focus stop.
    const glyph = back!.querySelector("svg");
    expect(glyph).not.toBeNull();
    expect(glyph!.getAttribute("focusable")).toBe("false");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
