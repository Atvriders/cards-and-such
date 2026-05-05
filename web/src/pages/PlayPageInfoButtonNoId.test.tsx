/**
 * Unit test pinning the absence of an `id` attribute on the PlayPage
 * session-info trigger button (W2046).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674-1686) renders the session-info trigger as
 *     `<button ref={infoButtonRef} type="button" className="play-info-btn"
 *              onClick={...} aria-label="Session info" aria-expanded={infoOpen}
 *              aria-haspopup="dialog" data-testid="play-info-btn"
 *              title="Session info">i</button>`
 *   It deliberately does NOT carry an `id` attribute — focus restoration
 *   uses the `infoButtonRef` ref, the popover advertises itself with
 *   `aria-label` (not `aria-labelledby`), and no external element points
 *   at the trigger via `aria-controls`/`aria-describedby`. So an `id`
 *   would be dead weight; adding one would also invite external code or
 *   tooling to start coupling against that id.
 *
 *   Sibling tests cover OTHER attributes on this very button — class,
 *   aria-expanded, aria-label/title, aria-haspopup, glyph contents,
 *   click-to-toggle behavior — but NONE of them assert that the trigger
 *   button has NO `id` attribute. A regression that started emitting
 *   `id="play-info-btn"` (or any other id) would silently slip past every
 *   existing test. This single focused assertion fills that gap.
 *
 * Strategy mirrors PlayPageInfoPopoverNoId.test.tsx (W2033):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Find `play-info-btn` and assert `hasAttribute("id") === false`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-button-no-id-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Button No-Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-button no-id test.",
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

describe("PlayPage info button has no `id` attribute (W2046)", () => {
  it("does not emit an `id` attribute on the play-info-btn element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the trigger button is mounted on the live
    // playing-phase header — the realistic surface where it lives.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // The trigger button must exist but must NOT carry an `id` attribute.
    // A regression that started emitting any id (e.g. for an external
    // aria-labelledby/aria-controls coupling) would fail this assertion.
    const btn = screen.getByTestId("play-info-btn");
    expect(btn.hasAttribute("id")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
