/**
 * Unit test for PlayPage settings-modal focus-trap Tab cycle (W1029).
 *
 * Observable behavior:
 *   PlayPage.tsx wires `useFocusTrap(settingsModalRef, settingsModalOpen)`.
 *   The trap installs a capture-phase keydown listener that intercepts Tab:
 *     - Plain Tab from the LAST focusable wraps to the FIRST.
 *     - Shift+Tab from the FIRST (or anywhere outside the container)
 *       wraps to the LAST.
 *
 *   Sibling tests cover:
 *     - W1020 settingsModalFocus: that opening the modal places focus inside
 *       it (initial focus contract).
 *     - W988 settingsModalRole / W900/W906 open-close trigger / Esc close.
 *
 *   None of them assert the wrap-around Tab cycle that keeps keyboard users
 *   trapped inside the dialog. A regression that dropped the keydown
 *   listener (or stopped calling preventDefault + redirecting focus on the
 *   last element) would silently let Tab escape into the page chrome
 *   underneath the modal — a real-world break of the focus-trap contract
 *   under `aria-modal="true"`.
 *
 * Strategy mirrors PlayPage.settingsModalFocus.test.tsx (W1020):
 *   - Hoisted minimal fixture plugin with a boolean setting so the modal
 *     ships with at least two focusable descendants (the Close button and
 *     the toggle <input>), exercising a real wrap rather than the
 *     single-element edge case.
 *   - Mount at `/play/:gameId`, click `start-game`, click `play-settings-btn`
 *     to open the modal.
 *   - Enumerate focusables, focus the LAST one, dispatch a Tab keydown on
 *     `document` (the trap listens in the capture phase on the document),
 *     and assert focus wrapped to the FIRST focusable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-focus-trap-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Focus Trap Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings modal focus-trap test.",
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

describe("PlayPage settings modal focus-trap Tab cycle (W1029)", () => {
  it("wraps Tab from the last focusable back to the first", async () => {
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

    // Manually park focus on the last focusable, then fire a Tab keydown.
    last.focus();
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: "Tab" });

    // The trap must have intercepted Tab and redirected focus to the first
    // focusable, completing the wrap-around cycle.
    expect(document.activeElement).toBe(first);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
