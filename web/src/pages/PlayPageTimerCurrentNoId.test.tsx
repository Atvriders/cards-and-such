/**
 * W2056 — focused coverage of the PlayPage toolbar inner
 * `play-timer-current` span's lack of an `id` HTML attribute.
 *
 * PlayPage.tsx (~line 1794) renders the inner elapsed-time readout as
 *   `<span className="play-timer-current" data-testid="play-timer-current">
 *      {formatTime(elapsed)}
 *    </span>`
 * The inner readout carries className and data-testid only — no `id`.
 * Like the wrapper, this span mounts and unmounts as the play phase
 * transitions; assigning it an `id` would silently couple external
 * selectors (anchor fragments, ARIA labelledby/describedby, CSS
 * `#play-timer-current` rules, analytics hooks) to a span whose
 * lifecycle is not stable across phase changes and whose text content
 * mutates every second.
 *
 * Existing sibling coverage already pins many other facts about this
 * span:
 *   - PlayPageTimerCurrentClass.test.tsx (W1421) pins exact className
 *   - PlayPageTimeDisplayTag.test.tsx pins `tagName === "SPAN"`
 *   - PlayPage.timerTick / timerResume / timerFreezeOnEnd pin the
 *     formatted text content under various phase transitions
 *   - PlayPage.timerHiddenSetup / timerEndedPhase pin presence/absence
 *     across phase boundaries
 *   - PlayPageTimerNoId.test.tsx (W2035) pins the *outer* wrapper
 *     `play-timer` span's no-id fact — NOT this inner span.
 *
 * What none of those pin: the inner readout span's *attribute set* —
 * specifically, whether it carries an `id`. A regression that added
 * `id="play-timer-current"` (e.g. to wire an aria-labelledby, a CSS
 * `#play-timer-current` selector, or an analytics hook) would slip
 * past every existing test. Pin the negative attribute-presence fact
 * directly via `hasAttribute("id")`, which checks DOM attribute
 * presence regardless of value.
 *
 * Strategy mirrors PlayPageTimerCurrentClass.test.tsx (hoisted-fixture
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
  const TEST_GAME_ID = "timer-current-no-id-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Current No-Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for W2056 timer-current no-id test.",
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

describe("PlayPage inner play-timer-current has no id attribute (W2056)", () => {
  it("renders the play-timer-current readout span without an `id` HTML attribute", async () => {
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
    // `id="..."` to the inner readout would flip this from false to true.
    expect(current.hasAttribute("id") === false).toBe(true);
  });
});

void React;
