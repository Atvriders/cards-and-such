/**
 * Unit test pinning the absence of an inline `style` attribute on the
 * PlayPage session-info trigger button (W2149).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674-1686) renders the session-info trigger as
 *     `<button ref={infoButtonRef} type="button" className="play-info-btn"
 *              onClick={...} aria-label="Session info" aria-expanded={infoOpen}
 *              aria-haspopup="dialog" data-testid="play-info-btn"
 *              title="Session info">i</button>`
 *   The JSX deliberately omits a `style={...}` prop — all visual styling
 *   (size, padding, border, background, focus ring) is owned by the
 *   `play-info-btn` CSS class so designers can re-skin without touching
 *   the component, and so the rendered DOM stays clean for AT/SSR
 *   introspection.
 *
 *   Sibling tests already pin OTHER attributes on this very button —
 *   className equality (PlayPageInfoButtonClass, W…), `id` absence
 *   (PlayPageInfoButtonNoId, W2046), aria-expanded
 *   (PlayPage.headerInfoAriaExpanded), title/aria-label, glyph contents,
 *   click-to-toggle behavior — but NONE of them assert that the trigger
 *   button has NO inline `style` attribute. A regression that added a
 *   stray `style={{...}}` (e.g. a `style={{ display: "inline-flex" }}`
 *   debug crumb, or a hard-coded `style={{ color: "#000" }}` that defeats
 *   the class) would slip past every existing test while silently
 *   overriding the class-driven contract. This single focused assertion
 *   fills that gap.
 *
 * Strategy mirrors PlayPageInfoPopoverNoStyle.test.tsx (W2107) and
 * PlayPageInfoButtonNoId.test.tsx (W2046):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase
 *     (so the trigger button is on the live playing-phase header).
 *   - Find `play-info-btn` and assert `hasAttribute("style") === false`
 *     (attribute literally absent, not present-but-empty).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-button-no-style-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Button No-Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-button no-inline-style test.",
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

describe("PlayPage info button has no inline `style` attribute (W2149)", () => {
  it("does not emit a `style` attribute on the play-info-btn element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the trigger button mounts on the live
    // playing-phase header — the realistic surface where it lives.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Sanity: pin the className-driven styling contract that makes the
    // negative assertion below meaningful. If the button ever migrates
    // away from class-driven styling to inline style, this test should be
    // updated rather than silently weakened.
    const btn = screen.getByTestId("play-info-btn");
    expect(btn.className).toBe("play-info-btn");

    // The contract: NO inline `style` attribute is rendered on the
    // trigger. A regression that added a `style={{...}}` prop (even one
    // with no rules in production) would fail here.
    expect(btn.hasAttribute("style")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
