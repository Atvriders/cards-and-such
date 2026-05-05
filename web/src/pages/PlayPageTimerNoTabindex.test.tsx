/**
 * W2301 — focused coverage of the PlayPage toolbar `play-timer` wrapper
 * span's lack of a `tabindex` HTML attribute.
 *
 * PlayPage.tsx (~line 1788) renders the toolbar elapsed-time wrapper as
 *   `<span className={`play-timer${paused ? " play-timer--paused" : ""}`}
 *          data-testid="play-timer"
 *          title={...}
 *          aria-label={...}>`
 * The wrapper carries className, data-testid, title and aria-label. It is
 * a purely informational HUD widget — the elapsed time read-out — and is
 * not a keyboard interaction target. Adding `tabIndex={0}` would inject a
 * non-actionable stop into the keyboard tab sequence; adding
 * `tabIndex={-1}` would make it programmatically focusable, which other
 * focus-management code (modal focus traps, end-of-game focus restore,
 * etc.) might then pick up unintentionally. Either drift would silently
 * regress accessibility / focus semantics.
 *
 * Existing sibling coverage pins many other facts about this span
 * (className, paused class, aria-label, title, tag, no `id`, no inline
 * style, formatted text content, freeze-on-end behaviour) but none assert
 * the absence of `tabindex`. Pin the negative attribute-presence fact
 * directly via `hasAttribute("tabindex")`, which checks DOM attribute
 * presence regardless of value.
 *
 * Strategy mirrors PlayPageTimerNoId.test.tsx (hoisted-fixture pattern):
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
  const TEST_GAME_ID = "timer-no-tabindex-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer No-Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for W2301 timer no-tabindex test.",
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

describe("PlayPage timer wrapper has no tabindex attribute (W2301)", () => {
  it("renders the play-timer wrapper span without a `tabindex` HTML attribute", async () => {
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
    // `tabIndex={0}` or `tabIndex={-1}` to the timer wrapper would flip
    // this from false to true.
    expect(timer.hasAttribute("tabindex") === false).toBe(true);
  });
});

void React;
