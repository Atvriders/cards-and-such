/**
 * Unit test for PlayPage hint button gating without plugin hint (W171).
 *
 * Verifies that when the active plugin does NOT expose a `hint?` callback,
 * the in-game `play-hint-btn`:
 *   1. Is either absent from the DOM, or
 *   2. Is rendered as disabled / `aria-disabled` so the user cannot trigger
 *      a hint flow on a plugin that hasn't opted in.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin WITHOUT a `hint` field. The
 *     factory must run before vi.mock evaluates the registry mock.
 *   - PlayPage renders the toolbar when `phase === "playing" && hintsEnabled`
 *     and applies `disabled={!plugin.hint || ...}` to the hint button. We
 *     explicitly enable hints in localStorage so the gate under test is the
 *     plugin-capability gate, not the user setting.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so the vi.mock factory below can reference it. vi.hoisted
// runs before the mocked module's imports are evaluated, so the closure is
// safe even though it visually looks like a TDZ violation.
// Crucially this plugin omits `hint` entirely — that is the condition under
// test.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "hint-gating-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint Gating Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin lacking a hint() callback.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    // No `hint` field on purpose.
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
  // Ensure the user-level hints toggle isn't what's hiding the button —
  // we want to assert the plugin-capability gate specifically.
  localStorage.setItem("cards-hints-enabled", "true");
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage hint button gating without plugin hint (W171)", () => {
  it("renders the hint button as absent or disabled when the plugin has no hint()", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the in-game toolbar (which contains
    // the hint button) commits.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.queryByTestId("play-hint-btn");

    if (btn === null) {
      // Acceptable outcome: the button isn't rendered at all when the
      // plugin doesn't support hints.
      expect(btn).toBeNull();
      return;
    }

    // Otherwise the button must be non-interactive: either the native
    // `disabled` attribute is set, or `aria-disabled="true"` is present.
    const nativeDisabled =
      (btn as HTMLButtonElement).disabled === true ||
      btn.hasAttribute("disabled");
    const ariaDisabled = btn.getAttribute("aria-disabled") === "true";
    expect(nativeDisabled || ariaDisabled).toBe(true);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
