/**
 * Unit test for the dynamic hint-button aria-label during cooldown (W930).
 *
 * Sibling W922 (PlayPage.headerHintButton.test.tsx) pins the *static*
 * branch of the aria-label — when the cooldown gate is disabled (or no
 * cooldown is currently armed) the button announces simply "Hint". The
 * other branch — fired when `hintCooldownEnabled && hintCooldown > 0` —
 * swaps the label to a countdown string of the form
 * `Hint, available in ${hintCooldown} seconds` (PlayPage.tsx ~line 2024)
 * so screen-reader users get the same "why is this disabled" feedback
 * sighted users get from the visible "Ns" label. No existing test covers
 * that dynamic branch, so a regression that re-worded it ("ready in",
 * "wait Ns", silent label) or dropped the seconds interpolation entirely
 * would slip through every other PlayPage test.
 *
 * Strategy:
 *   - Re-use the W922 fixture (a minimal plugin with `hint()` defined)
 *     but point its selector at a real DOM node so the click path
 *     actually fires `setHintCooldown(...)` (the no-target branch in
 *     `showHint` bails before arming the cooldown — see line 946-948).
 *     The fixture's `component` renders `<span data-testid="fx-count">`,
 *     so we target that.
 *   - Pre-seed `cards-hints-enabled = "true"` (so the button mounts) and
 *     `cards-hint-cooldown = "true"` (default-on, but make it explicit
 *     to be robust against default flips).
 *   - Install fake timers BEFORE mount with `shouldAdvanceTime: true` so
 *     the 1Hz cooldown ticker (PlayPage.tsx ~line 769-775) doesn't race
 *     synchronous click handling — `shouldAdvanceTime` lets microtasks /
 *     RAF callbacks complete naturally during the click while still
 *     letting us pin the just-armed cooldown value before any tick
 *     decrements it.
 *   - Click the start button to enter the playing phase, then click the
 *     hint button to arm the cooldown (HINT_COOLDOWN_MS / 1000 = 3s).
 *   - Assert the aria-label matches the dynamic format including the
 *     seconds count.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-cooldown-label-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Cooldown Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W930 dynamic aria-label test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // Selector points at a real node in the rendered fixture component
    // so `document.querySelector(target.selector)` returns non-null and
    // `showHint` reaches the `setHintCooldown(...)` arming step.
    hint: () => ({ selector: "[data-testid='fx-count']" }),
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  // Hints enabled so the button mounts at all.
  localStorage.setItem("cards-hints-enabled", "true");
  // Cooldown gate explicitly on (its real default-on too, per W775).
  localStorage.setItem("cards-hint-cooldown", "true");
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage hint button cooldown aria-label (W930)", () => {
  it("swaps aria-label to 'Hint, available in Ns' once cooldown is armed", async () => {
    // Fake timers must be installed BEFORE mount so the cooldown ticker's
    // setInterval is captured. `shouldAdvanceTime: true` lets the click
    // handler's synchronous setState propagate without us manually pumping
    // the scheduler (just enough for React to flush the re-render).
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn");
    // Sanity-check that we actually started in the static branch — if
    // this drifts to a countdown string before the click, the test below
    // would assert the wrong branch.
    expect(btn.getAttribute("aria-label")).toBe("Hint");

    // Click to fire the hint and arm the cooldown. HINT_COOLDOWN_MS is
    // 3000 in PlayPage.tsx, so `Math.ceil(3000 / 1000) === 3` is the
    // initial countdown value — and any 1Hz tick that's already fired
    // before our assertion would land on 2, so we accept 1..3 to keep
    // the test robust against scheduler timing on slow CI runs.
    fireEvent.click(btn);

    const labelAfter = btn.getAttribute("aria-label") ?? "";
    expect(labelAfter).toMatch(/^Hint, available in [123] seconds$/);
  });
});

void React;
