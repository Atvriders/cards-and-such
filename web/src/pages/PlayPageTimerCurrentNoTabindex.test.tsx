/**
 * W2302 — focused coverage of the PlayPage toolbar inner
 * `play-timer-current` span's lack of a `tabindex` HTML attribute.
 *
 * PlayPage.tsx (~line 1794) renders the inner elapsed-time readout as
 *   `<span className="play-timer-current" data-testid="play-timer-current">
 *      {formatTime(elapsed)}
 *    </span>`
 * The inner readout carries className and data-testid only — no
 * `tabindex`. This span is purely a passive textual readout: it mutates
 * every second as time elapses and mounts/unmounts as the play phase
 * transitions. Adding `tabindex` (whether `0` to make it focusable or
 * `-1` to make it programmatically focusable) would inject the readout
 * into focus management in surprising ways:
 *   - `tabindex="0"` would place a non-interactive text node into the
 *     keyboard tab order, where each Tab keystroke would land on a span
 *     whose only contribution is showing the current time — confusing
 *     for keyboard users and screen-reader users alike, who expect tab
 *     stops on actionable controls.
 *   - `tabindex="-1"` would mark the span as a programmatic focus
 *     target, implying some other code intentionally moves focus here;
 *     no such flow exists, and a stale `tabindex="-1"` left over from a
 *     refactor would mislead future maintainers.
 *
 * Existing sibling coverage already pins many other facts about this
 * span:
 *   - PlayPageTimerCurrentClass.test.tsx (W1421) pins exact className
 *   - PlayPageTimerCurrentNoId.test.tsx (W2056) pins lack of `id`
 *   - PlayPageTimerCurrentNoStyle.test.tsx pins lack of inline `style`
 *   - PlayPageTimeDisplayTag.test.tsx pins `tagName === "SPAN"`
 *   - PlayPage.timerTick / timerResume / timerFreezeOnEnd pin the
 *     formatted text content under various phase transitions
 *   - PlayPage.timerHiddenSetup / timerEndedPhase pin presence/absence
 *     across phase boundaries
 *
 * What none of those pin: this inner span's `tabindex` attribute
 * presence. A regression that added e.g. `tabIndex={0}` (perhaps to
 * try to make the readout an aria-live anchor or to satisfy a
 * misguided lint rule) would slip past every existing test. Pin the
 * negative attribute-presence fact directly via
 * `hasAttribute("tabindex")`, which checks DOM attribute presence
 * regardless of value.
 *
 * Strategy mirrors PlayPageTimerCurrentNoId.test.tsx (hoisted-fixture
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
  const TEST_GAME_ID = "timer-current-no-tabindex-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Current No-Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for W2302 timer-current no-tabindex test.",
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

describe("PlayPage inner play-timer-current has no tabindex attribute (W2302)", () => {
  it("renders the play-timer-current readout span without a `tabindex` HTML attribute", async () => {
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

    const current = screen.getByTestId("play-timer-current");
    // Pin the attribute-presence fact directly. A regression that added
    // `tabIndex={0}` or `tabIndex={-1}` to the inner readout would flip
    // this from false to true.
    expect(current.hasAttribute("tabindex") === false).toBe(true);
  });
});

void React;
