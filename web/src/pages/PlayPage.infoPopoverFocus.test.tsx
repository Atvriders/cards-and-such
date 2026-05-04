/**
 * Unit test for PlayPage info-popover focus management (W1009).
 *
 * Observable behavior:
 *   PlayPage.tsx wires `useFocusTrap(infoPopoverRef, infoOpen)` (line ~659).
 *   When `infoOpen` flips true the trap synchronously moves focus from the
 *   trigger button into the popover surface — first focusable descendant
 *   wins, otherwise the container itself (it carries `tabIndex={-1}`).
 *
 *   Sibling tests cover:
 *     - W984 infoPopoverRole: pins role="dialog" on the popover element.
 *     - W?? infoPopoverAriaLabel / infoPopoverAriaModal: aria-label and
 *       aria-modal attributes.
 *     - W975 headerInfoAriaExpanded: trigger's aria-expanded toggle.
 *
 *   None of them assert focus actually lands inside the popover when
 *   opened. A regression that dropped the `useFocusTrap` call, removed
 *   `tabIndex={-1}` from the container with no inner focusables, or
 *   otherwise stranded keyboard focus on the trigger would silently break
 *   the dialog focus contract that AT users rely on after activating an
 *   `aria-haspopup="dialog"` button — this test pins exactly that.
 *
 * Strategy mirrors PlayPage.infoPopoverRole.test.tsx:
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Assert document.activeElement is contained within the popover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-focus-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Focus Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover focus test.",
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

describe("PlayPage info popover focus management (W1009)", () => {
  it("moves focus into the popover when opened", async () => {
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
    const trigger = screen.getByTestId("play-info-btn");
    fireEvent.click(trigger);

    const popover = screen.getByTestId("play-info-popover");

    // The focus trap must yank focus off the trigger button and place it
    // inside the popover — either on the first focusable descendant (e.g.
    // the Close button) or on the container itself (tabIndex=-1 fallback).
    const active = document.activeElement as HTMLElement | null;
    expect(active).not.toBe(trigger);
    expect(active).not.toBeNull();
    expect(popover.contains(active)).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
