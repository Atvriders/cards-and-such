/**
 * W2418 — focused coverage of the PlayPage toolbar inner
 * `play-timer-current` span's lack of a `title` HTML attribute.
 *
 * PlayPage.tsx (~line 1794) renders the inner elapsed-time readout as
 *   `<span className="play-timer-current" data-testid="play-timer-current">
 *      {formatTime(elapsed)}
 *    </span>`
 * The inner readout carries className and data-testid only — no
 * `title`. This is load-bearing because the *outer* timer wrapper
 * (~line 1788) DOES carry a `title` ("Paused" / "Elapsed time"), as
 * does the sibling `play-timer-best` span ("Personal best"). It would
 * be tempting for a future refactor to mirror that pattern and add a
 * `title` attribute to the inner readout too — but doing so would:
 *   - Produce a redundant native browser tooltip stacked on top of the
 *     parent's tooltip, since hovering the inner span also bubbles to
 *     the parent.
 *   - Conflict with the parent's `aria-label` semantics, which already
 *     describes the elapsed time for assistive tech.
 *   - Risk drift between the parent's localized tooltip and any new
 *     inner tooltip string.
 *
 * Existing sibling coverage already pins many other facts about this
 * span:
 *   - PlayPageTimerCurrentClass.test.tsx (W1421) pins exact className
 *   - PlayPageTimerCurrentNoId.test.tsx (W2056) pins lack of `id`
 *   - PlayPageTimerCurrentNoStyle.test.tsx pins lack of inline `style`
 *   - PlayPageTimerCurrentNoTabindex.test.tsx (W2302) pins lack of
 *     `tabindex`
 *   - PlayPageTimeDisplayTag.test.tsx pins `tagName === "SPAN"`
 *   - PlayPage.timerTick / timerResume / timerFreezeOnEnd pin the
 *     formatted text content under various phase transitions
 *   - PlayPage.timerHiddenSetup / timerEndedPhase pin presence/absence
 *     across phase boundaries
 *
 * What none of those pin: this inner span's `title` attribute presence.
 * A regression that added e.g. `title="Elapsed time"` (perhaps copying
 * the parent's tooltip onto the readout for "discoverability") would
 * slip past every existing test. Pin the negative attribute-presence
 * fact directly via `hasAttribute("title")`, which checks DOM
 * attribute presence regardless of value.
 *
 * Strategy mirrors PlayPageTimerCurrentNoTabindex.test.tsx
 * (hoisted-fixture pattern):
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
  const TEST_GAME_ID = "timer-current-no-title-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Current No-Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for W2418 timer-current no-title test.",
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

describe("PlayPage inner play-timer-current has no title attribute (W2418)", () => {
  it("renders the play-timer-current readout span without a `title` HTML attribute", async () => {
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
    // a `title="..."` prop to the inner readout would flip this from
    // false to true. The parent `play-timer` span and sibling
    // `play-timer-best` span both have `title`; the inner readout
    // intentionally does not.
    expect(current.hasAttribute("title") === false).toBe(true);
  });
});

void React;
