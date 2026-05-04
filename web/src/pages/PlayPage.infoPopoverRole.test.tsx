/**
 * Unit test for the PlayPage info popover role="dialog" attribute (W984).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1687-1696) renders the session-info popover as a
 *   `<div data-testid="play-info-popover" role="dialog" aria-modal="true"
 *   aria-label="Session info">` once `infoOpen` flips true. The trigger
 *   button declares `aria-haspopup="dialog"` (W900) so the popover MUST
 *   actually expose `role="dialog"` to honour the disclosure contract that
 *   screen readers announce when the user activates the trigger.
 *
 *   Sibling tests cover:
 *     - W900 headerInfoButton: the trigger's static UI contract including
 *       its `aria-haspopup="dialog"` declaration — does NOT inspect the
 *       popover element itself.
 *     - W975 headerInfoAriaExpanded: trigger's dynamic aria-expanded
 *       toggle — also does not inspect the popover's role.
 *     - infoSeedShown / infoSessionCounter / actionLog: popover *contents*
 *       once it is open, but they read text rather than the dialog role.
 *
 *   None of them pin `role="dialog"` on the popover element. A regression
 *   that dropped the role, swapped it for `role="region"`, or omitted the
 *   attribute (getAttribute -> null) would silently break the dialog
 *   semantics that AT users rely on after activating a "haspopup=dialog"
 *   trigger.
 *
 * Strategy mirrors PlayPage.headerInfoAriaExpanded.test.tsx:
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find `play-info-popover` and assert role="dialog" exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-role-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover role=dialog test.",
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

describe("PlayPage info popover role=dialog (W984)", () => {
  it("exposes role=\"dialog\" on the play-info-popover element when opened", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so we are exercising the popover on the live
    // playing-phase header — the realistic surface AT users encounter
    // mid-session after activating the haspopup="dialog" trigger.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    // The popover must now exist and carry role="dialog" exactly. A
    // regression that dropped the attribute (-> null), swapped to
    // "region", or otherwise diverged from the trigger's
    // aria-haspopup="dialog" contract would fail this assertion.
    const popover = screen.getByTestId("play-info-popover");
    expect(popover.getAttribute("role")).toBe("dialog");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
