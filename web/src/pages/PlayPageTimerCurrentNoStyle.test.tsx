/**
 * Focused coverage of the PlayPage toolbar inner
 * `play-timer-current` span's lack of an inline `style` HTML attribute.
 *
 * PlayPage.tsx (~line 1794) renders the inner elapsed-time readout as
 *   `<span className="play-timer-current" data-testid="play-timer-current">
 *      {formatTime(elapsed)}
 *    </span>`
 * The inner readout carries `className` and `data-testid` only — no
 * `style={...}` prop. All visual styling is driven by the CSS hook
 * `.play-timer-current` so the theming layer (and the parent's
 * `play-timer--paused` modifier cascade) remains the single source of
 * truth.
 *
 * Existing sibling coverage already pins many other facts about this
 * span:
 *   - PlayPageTimerCurrentClass.test.tsx (W1421) pins exact className
 *   - PlayPageTimerCurrentNoId.test.tsx (W2056) pins lack of `id`
 *   - PlayPageTimeDisplayTag.test.tsx pins `tagName === "SPAN"`
 *   - PlayPage.timerTick / timerResume / timerFreezeOnEnd pin the
 *     formatted text content under various phase transitions
 *   - PlayPageTimerNoStyle.test.tsx (W2115) pins the *outer* wrapper
 *     `play-timer` span's no-style fact — NOT this inner span.
 *
 * What none of those pin: the inner readout span's *lack* of an inline
 * `style` attribute. A refactor that introduced
 * `style={{ color: paused ? ... : ... }}` (or any other inline style)
 * would bypass the CSS layer, defeat theming, and slip past every
 * existing test. Pin the negative attribute-presence fact directly via
 * `hasAttribute("style")`, which checks DOM attribute presence
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
  const TEST_GAME_ID = "timer-current-no-style-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Current No-Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer-current no-style attribute test.",
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

describe("PlayPage inner play-timer-current has no inline style attribute", () => {
  it("renders the play-timer-current readout span without a `style` HTML attribute", async () => {
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
    // `style={{ ... }}` to the inner readout would flip this from false
    // to true.
    expect(current.hasAttribute("style") === false).toBe(true);
  });
});

void React;
