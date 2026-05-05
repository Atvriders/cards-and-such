/**
 * W2035 — focused coverage of the PlayPage toolbar `play-timer` wrapper
 * span's lack of an `id` HTML attribute.
 *
 * PlayPage.tsx (~line 1788) renders the toolbar elapsed-time wrapper as
 *   `<span className={`play-timer${paused ? " play-timer--paused" : ""}`}
 *          data-testid="play-timer"
 *          title={...}
 *          aria-label={...}>`
 * The wrapper carries className, data-testid, title and aria-label, but
 * deliberately has no `id`. The timer wrapper is a transient HUD widget
 * that mounts and unmounts as the play phase changes; assigning it an
 * `id` would silently couple external selectors (anchor fragments, ARIA
 * labelledby/describedby, CSS `#play-timer` rules, analytics hooks) to a
 * span whose lifecycle is not stable across phase transitions.
 *
 * Existing sibling coverage already pins many other facts about this
 * span:
 *   - PlayPageTimerWrapperClass.test.tsx (W1910) pins exact className
 *   - PlayPage.timerPausedAria.test.tsx pins the paused aria-label and
 *     the `play-timer--paused` modifier class
 *   - PlayPageTimerTitle.test.tsx / PlayPageTimerPausedTitle.test.tsx
 *     pin the `title` attribute in both states
 *   - PlayPageTimeDisplayTag.test.tsx pins `tagName === "SPAN"`
 *   - PlayPage.timerTick / timerResume / timerFreezeOnEnd pin the
 *     formatted text content under various phase transitions
 *   - PlayPageTimerCurrentClass / PlayPageTimerPausedClass cover the
 *     *inner* `play-timer-current` span's className
 *
 * What none of those pin: the wrapper span's *attribute set* — in
 * particular, whether the wrapper carries an `id`. A regression that
 * added `id="play-timer"` (e.g. to wire an aria-labelledby, a CSS
 * `#play-timer` selector, or an analytics hook) would slip past every
 * existing test. Pin the negative attribute-presence fact directly via
 * `hasAttribute("id")`, which checks DOM attribute presence regardless
 * of value.
 *
 * Strategy mirrors PlayPageTimerWrapperClass.test.tsx (hoisted-fixture
 * pattern):
 *   - vi.hoisted fixture plugin so the vi.mock factory captures it.
 *   - Confetti null-stub avoids canvas APIs jsdom does not ship.
 *   - Cross the setup -> playing phase boundary by clicking
 *     `start-game` so the toolbar timer mounts (it only renders when
 *     phase === "playing" || phase === "ended").
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-no-id-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer No-Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for W2035 timer no-id test.",
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

describe("PlayPage timer wrapper has no id attribute (W2035)", () => {
  it("renders the play-timer wrapper span without an `id` HTML attribute", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Cross the setup -> playing phase boundary so the toolbar timer mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const timer = screen.getByTestId("play-timer");
    // Pin the attribute-presence fact directly. A regression that added
    // `id="..."` to the timer wrapper would flip this from false to true.
    expect(timer.hasAttribute("id") === false).toBe(true);
  });
});

void React;
