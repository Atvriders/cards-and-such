/**
 * Unit test for PlayPage settings-modal focus-trap Shift+Tab cycle (W1050).
 *
 * Observable behavior:
 *   PlayPage.tsx wires `useFocusTrap(settingsModalRef, settingsModalOpen)`.
 *   The trap installs a capture-phase keydown listener that intercepts Tab:
 *     - Plain Tab from the LAST focusable wraps to the FIRST (covered by
 *       W1029 in PlayPage.settingsModalFocusTrap.test.tsx).
 *     - Shift+Tab from the FIRST focusable wraps to the LAST — the reverse
 *       direction this test pins down.
 *
 *   Without this assertion, a regression that broke only the shift-branch
 *   of the trap (e.g. dropping the `event.shiftKey` check or only handling
 *   forward Tab) would leak keyboard focus out the top of the modal into
 *   the page chrome underneath, silently violating the `aria-modal="true"`
 *   contract for screen-reader and keyboard-only users.
 *
 * Strategy mirrors the W1029 sibling test, swapping the direction:
 *   - Hoisted minimal fixture plugin with a boolean setting so the modal
 *     ships with at least two focusable descendants (the Close button and
 *     the toggle <input>).
 *   - Mount at `/play/:gameId`, click `start-game`, click `play-settings-btn`
 *     to open the modal.
 *   - Enumerate focusables, focus the FIRST one, dispatch a Shift+Tab
 *     keydown on `document` (the trap listens in the capture phase on the
 *     document), and assert focus wrapped to the LAST focusable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-shift-tab-loop-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Shift+Tab Loop Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the settings modal Shift+Tab focus-trap test.",
    settings: settingsSchema,
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

describe("PlayPage settings modal focus-trap Shift+Tab cycle (W1050)", () => {
  it("wraps Shift+Tab from the first focusable back to the last", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the in-game header (where the settings button
    // lives) mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the modal.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    const modal = screen.getByTestId("play-settings-modal");

    // Enumerate focusables exactly as useFocusTrap does — the same
    // selector/filter pair guarantees we exercise the same set the trap
    // operates on.
    const FOCUSABLE_SELECTOR =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(
      modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter(
      (n) =>
        !n.hasAttribute("disabled") && n.getAttribute("aria-hidden") !== "true",
    );
    // Need at least two distinct focusables to meaningfully test wrap.
    expect(focusables.length).toBeGreaterThanOrEqual(2);

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    expect(first).not.toBe(last);

    // Manually park focus on the first focusable, then fire a Shift+Tab
    // keydown.
    first.focus();
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    // The trap must have intercepted Shift+Tab and redirected focus to the
    // last focusable, completing the reverse wrap-around cycle.
    expect(document.activeElement).toBe(last);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
