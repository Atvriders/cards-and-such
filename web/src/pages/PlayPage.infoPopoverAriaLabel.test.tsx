/**
 * Unit test for the PlayPage info popover aria-label="Session info" (W996).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1687-1696) renders the session-info popover as a
 *   `<div data-testid="play-info-popover" role="dialog" aria-modal="true"
 *   aria-label="Session info">` once `infoOpen` flips true. Per W984's
 *   note, the popover element MUST carry `aria-label="Session info"` so
 *   that screen readers announce a meaningful name for the dialog when
 *   it appears (an unnamed dialog is announced merely as "dialog").
 *
 *   Sibling tests cover:
 *     - W984 infoPopoverRole: pins role="dialog" on the popover element
 *       but does NOT assert aria-label.
 *     - W900 headerInfoButton: the trigger button's aria-label="Session
 *       info" — that is the trigger, not the popover, so a regression
 *       that dropped the popover's aria-label would still pass W900.
 *     - infoSeedShown / infoSessionCounter / actionLog: popover contents,
 *       not the popover element's accessible name.
 *
 *   None of them pin `aria-label="Session info"` on the popover element.
 *   A regression that dropped or renamed the attribute would silently
 *   strip the dialog's accessible name without any other test failing.
 *
 * Strategy mirrors PlayPage.infoPopoverRole.test.tsx:
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find `play-info-popover` and assert aria-label === "Session info".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-aria-label-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Aria-Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover aria-label test.",
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

describe("PlayPage info popover aria-label (W996)", () => {
  it("exposes aria-label=\"Session info\" on the play-info-popover element when opened", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so we exercise the popover on the live playing-
    // phase header — the realistic surface AT users encounter mid-session.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    // The popover must carry aria-label="Session info" exactly. A
    // regression that dropped the attribute (-> null), renamed it to
    // "Game info" / "Info", or otherwise diverged from the documented
    // accessible name would fail this assertion.
    const popover = screen.getByTestId("play-info-popover");
    expect(popover.getAttribute("aria-label")).toBe("Session info");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
