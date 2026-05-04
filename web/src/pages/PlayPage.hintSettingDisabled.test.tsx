/**
 * Unit test for PlayPage hint button user-setting gate (W775).
 *
 * Verifies that when the user has turned hints OFF in Settings → Gameplay
 * (`cards-hints-enabled === "false"`), the in-game `play-hint-btn` is NOT
 * rendered at all, even when:
 *   - the active plugin DOES expose a `hint?` callback (so the
 *     plugin-capability gate, covered by W171/W636, is satisfied), and
 *   - we're on the in-game phase ("playing"), so the toolbar is mounted.
 *
 * This complements:
 *   - W171 / W636 (PlayPage.hintGating.test.tsx) — capability gate
 *   - W496 (PlayPage.hint.test.tsx) — pulse lifecycle
 *   - W692 / W698 (PlayPage.hintCooldown.test.tsx) — cooldown gate
 *   - W725 (PlayPage.hintTooltip.test.tsx) — tooltip lifecycle
 *
 * The user-level "Enable hints" preference acts as a hard gate: the JSX
 * is `phase === "playing" && hintsEnabled` so the button MUST be absent
 * (not merely disabled) when the user opts out.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so the vi.mock factory below can reference it. Crucially
// this plugin DOES expose `hint`, so the only gate that can hide the
// button is the user-level `cards-hints-enabled` setting under test.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "hint-setting-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint Setting Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin WITH a hint() callback for setting-gate tests.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    hint: () => ({ selector: "[data-testid='hint-target']", pulses: 3 }),
    component: () => (
      <div>
        <div data-testid="hint-target">target</div>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
  // The condition under test: user has explicitly disabled hints in
  // Settings → Gameplay. Default is "true" (enabled), so we must set
  // "false" to exercise the off-state gate.
  localStorage.setItem("cards-hints-enabled", "false");
  // Cooldown disabled so a still-rendered-but-disabled button (the
  // alternative gating outcome) wouldn't be confused with the cooldown
  // disable path covered by W692.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage hint button hidden when hints disabled in settings (W775)", () => {
  it("does NOT render play-hint-btn when cards-hints-enabled is 'false'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the in-game toolbar (which conditionally
    // renders the hint button) commits. Without this, "no button" would be
    // ambiguous between phase-gating and the setting gate under test.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: we're definitely on the in-game phase — the always-present
    // restart button is rendered when `phase === "playing"`. If this lookup
    // ever fails, the test would silently pass for the wrong reason.
    expect(screen.getByTestId("play-restart-btn")).toBeTruthy();

    // The actual assertion: the hint button is gated out entirely by the
    // `hintsEnabled` clause in `phase === "playing" && hintsEnabled`.
    expect(screen.queryByTestId("play-hint-btn")).toBeNull();
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
