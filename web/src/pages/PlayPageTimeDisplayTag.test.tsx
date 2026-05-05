/**
 * Unit test for the PlayPage elapsed-time display tagName (W1889).
 *
 * The toolbar `play-timer-current` element is the *actual* readout of the
 * elapsed game timer — it wraps the `formatTime(elapsed)` text node that
 * ticks once per second while the game is in the playing phase. Existing
 * sibling tests cover its presence, its className, the 1Hz tick, the
 * pause/resume freeze behaviour, and the title/aria-label wiring on the
 * outer `play-timer` span — but NOT the *tagName* of the readout element
 * itself. A grep across `PlayPage*.test.tsx` for `play-timer.*tagName`
 * returns zero hits, so this test pins the literal "SPAN" tag. Without
 * this guard, a refactor that swapped the `<span>` readout for a `<div>`
 * (which would break inline header layout) or for any other element
 * could land silently because every other timer test merely queries by
 * testid and inspects text/class/title/aria.
 *
 * Harness mirrors `PlayPageTimerTitle.test.tsx`: a hoisted fixture plugin
 * keeps the registry mock TDZ-safe, and Confetti is null-stubbed because
 * jsdom has no canvas.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-display-tag-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Display Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for elapsed-time display tagName test.",
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

describe("PlayPage elapsed-time display tagName (W1889)", () => {
  it("renders play-timer-current with tagName === 'SPAN' while playing", async () => {
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

    const timeDisplay = screen.getByTestId("play-timer-current");
    // Pin the literal tag name. HTMLElement.tagName always returns the
    // upper-case form for HTML documents, so "SPAN" is the correct
    // canonical value to compare against.
    expect(timeDisplay.tagName).toBe("SPAN");
  });
});

void React;
