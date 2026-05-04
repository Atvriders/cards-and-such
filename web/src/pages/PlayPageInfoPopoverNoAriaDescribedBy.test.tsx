/**
 * Unit test for the PlayPage info popover NOT carrying aria-describedby (W1472).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1687-1696) renders the session-info popover as
 *   `<div role="dialog" aria-modal="true" aria-label="Session info"
 *   tabIndex={-1}>`. The popover deliberately exposes its accessible name
 *   via the `aria-label="Session info"` STRING contract and does NOT pair
 *   with a separate `aria-describedby` reference. Its contents (seed,
 *   started timestamp, plays-this-session, time-trend chart, action log)
 *   are read by AT users from the dialog body itself — there is no
 *   off-screen "description" node to point at.
 *
 *   Sibling tests pin the POSITIVE attributes:
 *     - W1465 wrapper className "play-info-popover"
 *     - W984  role="dialog"
 *     - W990  aria-modal="true"
 *     - aria-label="Session info"
 *     - W1419 tabIndex=-1
 *     - W1249 close-button className
 *     - W1268 how-to-play link className
 *     - W1330 action-log <summary> className
 *
 *   None assert the *absence* of aria-describedby. A regression that
 *   added a stale `aria-describedby="..."` pointing at a missing/empty
 *   element would produce a broken AT description (screen readers would
 *   announce nothing, or worse, the wrong node) while every other
 *   attribute test still passed. This test pins the documented contract
 *   that the popover labels itself via `aria-label` and exposes NO
 *   separate description reference.
 *
 * Strategy mirrors PlayPage.infoPopoverAriaModal.test.tsx (W990):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find `play-info-popover` and assert getAttribute("aria-describedby")
 *     is null (attribute literally absent, not "" or a stale id).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-no-aria-describedby-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover No Aria-DescribedBy Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the info-popover aria-describedby absence test.",
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

describe("PlayPage info popover has no aria-describedby (W1472)", () => {
  it("does not set aria-describedby on the play-info-popover element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the playing-phase header (with the info
    // trigger) mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    // Sanity: the positive accessible-name contract is via aria-label, not
    // a label/description reference. Pinning this here keeps the negative
    // assertion meaningful — if the popover ever migrates to
    // aria-labelledby/aria-describedby, this test should be updated, not
    // silently weakened.
    expect(popover.getAttribute("aria-label")).toBe("Session info");
    // The contract: NO aria-describedby is exposed. A regression that
    // added a stale id reference would fail here.
    expect(popover.getAttribute("aria-describedby")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
