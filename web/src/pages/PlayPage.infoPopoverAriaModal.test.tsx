/**
 * Unit test for the PlayPage info popover aria-modal="true" attribute (W995).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1687-1696) renders the session-info popover as a
 *   `<div data-testid="play-info-popover" role="dialog" aria-modal="true"
 *   aria-label="Session info">` once `infoOpen` flips true. The W984 sibling
 *   test pins `role="dialog"` on the same element but explicitly notes that
 *   `aria-modal="true"` is present and unchecked. Without a dedicated
 *   assertion, a regression that dropped the attribute (-> null), set it to
 *   "false", or omitted it entirely would silently weaken the dialog
 *   semantics — assistive technologies use aria-modal to scope their virtual
 *   cursor to the dialog and announce modality, so the contract matters.
 *
 *   Sibling tests cover:
 *     - W984 infoPopoverRole: the popover's role="dialog" attribute — does
 *       NOT inspect aria-modal.
 *     - W900 headerInfoButton: the trigger's static UI contract — does not
 *       inspect the popover element itself.
 *     - W975 headerInfoAriaExpanded: the trigger's dynamic aria-expanded
 *       toggle — does not inspect the popover element.
 *     - infoSeedShown / infoSessionCounter / actionLog: popover *contents*
 *       once open, but they read text rather than ARIA modality state.
 *
 *   None of them pin aria-modal="true" on the popover. This test fills that
 *   gap with a single, focused assertion.
 *
 * Strategy mirrors PlayPage.infoPopoverRole.test.tsx (W984):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find `play-info-popover` and assert aria-modal="true" exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-aria-modal-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Aria-Modal Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover aria-modal test.",
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

describe("PlayPage info popover aria-modal=\"true\" (W995)", () => {
  it("exposes aria-modal=\"true\" on the play-info-popover element when opened", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so we exercise the popover on the live playing-phase
    // header — the realistic surface AT users encounter mid-session after
    // activating the haspopup="dialog" trigger.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    // The popover must now exist and carry aria-modal="true" exactly. A
    // regression that dropped the attribute (-> null), set it to "false", or
    // otherwise diverged from the documented modal-dialog contract would
    // fail this assertion.
    const popover = screen.getByTestId("play-info-popover");
    expect(popover.getAttribute("aria-modal")).toBe("true");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
