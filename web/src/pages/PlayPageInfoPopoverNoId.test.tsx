/**
 * Unit test pinning the absence of an `id` attribute on the PlayPage
 * session-info popover element (W2033).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1687-1696) renders the session-info popover as
 *     `<div ref={infoPopoverRef} className="play-info-popover"
 *           role="dialog" aria-modal="true" aria-label="Session info"
 *           data-testid="play-info-popover" tabIndex={-1}>`
 *   It deliberately does NOT carry an `id` attribute — the trigger button
 *   uses `aria-haspopup="dialog"` and the popover advertises itself with
 *   `aria-label` rather than `aria-labelledby`/`aria-describedby` linkage,
 *   so an `id` is not required for the ARIA contract. Adding one would
 *   imply the popover is the target of an external reference (e.g. an
 *   `aria-controls`/`aria-labelledby` from somewhere) and would invite
 *   tooling/tests to start coupling against that id.
 *
 *   Sibling tests cover OTHER attributes on the same element — role,
 *   aria-modal, aria-label, tabIndex, data-testid, focus-restore, ESC
 *   close, click-close, popover contents — but none of them assert that
 *   the popover element has NO `id` attribute. A regression that started
 *   emitting `id="play-info-popover"` (or any other id) would silently
 *   slip past every existing test. This single focused assertion fills
 *   that gap.
 *
 * Strategy mirrors PlayPage.infoPopoverAriaModal.test.tsx (W990):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find `play-info-popover` and assert `hasAttribute("id") === false`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-no-id-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover No-Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover no-id test.",
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

describe("PlayPage info popover has no `id` attribute (W2033)", () => {
  it("does not emit an `id` attribute on the play-info-popover element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the popover trigger is reachable on the live
    // playing-phase header — the realistic surface where the popover
    // actually mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    // The popover element must exist but must NOT carry an `id` attribute.
    // A regression that started emitting any id (e.g. for an external
    // aria-labelledby/aria-controls coupling) would fail this assertion.
    const popover = screen.getByTestId("play-info-popover");
    expect(popover.hasAttribute("id")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
