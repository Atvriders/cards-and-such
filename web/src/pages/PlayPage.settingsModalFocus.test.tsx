/**
 * Unit test for PlayPage settings modal focus management (W1020).
 *
 * Observable behavior:
 *   PlayPage.tsx wires `useFocusTrap(settingsModalRef, settingsModalOpen)`
 *   (line ~660). When `settingsModalOpen` flips true the trap synchronously
 *   moves focus from the trigger button into the modal surface — first
 *   focusable descendant wins (typically the Close button), otherwise the
 *   container itself (it carries `tabIndex={-1}`).
 *
 *   Sibling tests cover:
 *     - W988 settingsModalRole: pins role="dialog" + aria-modal="true".
 *     - W730 settingsEsc: Esc-close behavior.
 *     - W900/W906 open/close trigger.
 *     - settingsModalAriaLabel / settingsModalCloseAriaLabel.
 *     - settingsModalTabIndex: pins tabIndex=-1 on the container.
 *
 *   None of them assert focus actually lands inside the modal when opened.
 *   A regression that dropped the `useFocusTrap` call, removed `tabIndex=-1`
 *   from the container, or otherwise stranded keyboard focus on the trigger
 *   would silently break the dialog focus contract that AT users rely on
 *   after activating an `aria-haspopup="dialog"` button — this test pins
 *   exactly that, mirroring W1009 (info popover focus) for the settings
 *   modal.
 *
 * Strategy mirrors PlayPage.infoPopoverFocus.test.tsx (W1009):
 *   - Hoisted minimal fixture plugin (with a settings entry so the modal
 *     has interactive content) so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-settings-btn` to open the modal.
 *   - Assert document.activeElement is contained within the modal.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-focus-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Focus Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings modal focus test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin, settingsSchema };
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

describe("PlayPage settings modal focus management (W1020)", () => {
  it("moves focus into the modal when opened", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so we are exercising the modal on the live
    // playing-phase header — the realistic surface AT users encounter
    // mid-session after activating the haspopup="dialog" trigger.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the modal.
    const trigger = screen.getByTestId("play-settings-btn");
    fireEvent.click(trigger);

    const modal = screen.getByTestId("play-settings-modal");

    // The focus trap must yank focus off the trigger button and place it
    // inside the modal — either on the first focusable descendant (e.g.
    // the Close button or the boolean toggle) or on the container itself
    // (tabIndex=-1 fallback).
    const active = document.activeElement as HTMLElement | null;
    expect(active).not.toBe(trigger);
    expect(active).not.toBeNull();
    expect(modal.contains(active)).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
