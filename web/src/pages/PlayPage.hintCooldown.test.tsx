/**
 * Unit test for PlayPage hint button cooldown (W692).
 *
 * The Hint button enforces a `HINT_COOLDOWN_MS = 3000ms` throttle when
 * the user has the "Hint cooldown" preference enabled (default on, key
 * `cards-hint-cooldown`). After firing a hint:
 *   1. The button renders as `disabled` until the cooldown elapses.
 *   2. A 1Hz `setInterval` ticks the visible countdown and re-enables
 *      the button once `hintCooldown` returns to 0.
 *
 * This test exercises (1) immediately after a click, advances the
 * virtual clock past the 3-second window, and asserts the button is
 * interactive again.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin whose `hint()` resolves to
 *     a real selector so the `showHint` callback actually arms the
 *     cooldown (failed lookups don't arm it).
 *   - Fake timers with `shouldAdvanceTime: true` are installed BEFORE
 *     mount per the W639 pattern, so the 1Hz cooldown ticker registers
 *     against the virtual clock without freezing mount-phase microtasks.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so the vi.mock factory below can reference it. The plugin
// must expose a `hint` whose selector resolves on the rendered Game so the
// cooldown actually arms — `showHint` only sets `hintCooldown` when a hint
// fires successfully.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "hint-cooldown-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint Cooldown Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for hint-cooldown lifecycle tests.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    hint: () => ({ selector: "[data-testid='hint-target']", pulses: 1 }),
    component: () => (
      <div>
        <div data-testid="hint-target">target</div>
      </div>
    ),
  };
  // Keep a `klondike`-shaped entry so any registry-coupled lobby code
  // that scans for it doesn't blow up.
  const klondikeFixture = { ...fixturePlugin, id: "klondike", title: "Klondike" };
  return { TEST_GAME_ID, fixturePlugin, klondikeFixture };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin, hoisted.klondikeFixture],
}));

beforeEach(() => {
  localStorage.clear();
  // Make both the user-level hints toggle AND the cooldown toggle explicit
  // so this test isn't subject to default-changes elsewhere. The cooldown
  // gate is the contract under test.
  localStorage.setItem("cards-hints-enabled", "true");
  localStorage.setItem("cards-hint-cooldown", "true");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage hint button cooldown (W692)", () => {
  it("bypasses the cooldown when cards-hint-cooldown is disabled (W698)", async () => {
    // Override the per-test default flipped on in beforeEach. With the
    // cooldown preference off, `readHintCooldownEnabled()` resolves to
    // false, so the button's disabled gate collapses to `!plugin.hint`
    // alone — clicking the hint must NOT disable it.
    localStorage.setItem("cards-hint-cooldown", "false");

    // Match the sibling test's timer setup: install fake timers BEFORE
    // mount so any hint-related setInterval registers against the
    // virtual clock from the start (W639 mount-phase pattern). With the
    // cooldown disabled the ticker shouldn't even be armed, but using
    // the same harness keeps the contrast between the two tests clean.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the toolbar (and the fixture's
    // hint target) commits.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn") as HTMLButtonElement;
    // Sanity: button is interactive before the click — plugin exposes
    // `hint`, no cooldown ever gates this branch.
    expect(btn.disabled).toBe(false);

    // Click fires showHint which pulses the target. With the cooldown
    // preference disabled, `hintCooldownEnabled` is false, so the
    // `setHintCooldown(...)` arming branch is skipped entirely.
    fireEvent.click(btn);

    // The contract under test: even immediately after a successful
    // hint click the button stays enabled because the cooldown gate
    // is bypassed when the user has opted out of throttling.
    expect(btn.disabled).toBe(false);
  });

  it("disables the hint button after click and re-enables it after the 3s cooldown", async () => {
    // Install fake timers BEFORE mount so the cooldown ticker's setInterval
    // registers against the virtual clock from the start. `shouldAdvanceTime`
    // keeps mount-phase microtasks from deadlocking (W639 pattern).
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the toolbar (containing the Hint button)
    // commits and the fixture's Game.tsx renders the hint target.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn") as HTMLButtonElement;
    // Sanity: the button is interactive before any click — the plugin
    // exposes `hint` and no cooldown is active yet.
    expect(btn.disabled).toBe(false);

    // Click fires showHint which (a) pulses the target and (b) arms the
    // cooldown by setting hintCooldown = ceil(3000 / 1000) = 3 seconds.
    fireEvent.click(btn);

    // The button must immediately render as disabled — the cooldown gate
    // is `disabled={!plugin.hint || (hintCooldownEnabled && hintCooldown > 0)}`.
    expect(btn.disabled).toBe(true);

    // Advance the virtual clock past the full 3s window. The 1Hz ticker
    // decrements `hintCooldown` each second until it hits 0, at which
    // point the disabled prop flips back to false.
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    // The button references the same DOM node throughout — no need to
    // re-query. After the cooldown elapses it must be interactive again.
    expect(btn.disabled).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
