/**
 * Unit test for the PlayPage toolbar `play-timer` wrapper element's
 * tagName (W2343).
 *
 * The toolbar wrapper carrying `data-testid="play-timer"` is rendered
 * as a <span> in PlayPage.tsx. Existing `play-timer` wrapper tests pin:
 *   - exact className equality (PlayPageTimerWrapperClass)
 *   - paused className modifier (PlayPageTimerPausedClass)
 *   - `title` attribute (PlayPageTimerTitle / PlayPageTimerPausedTitle)
 *   - `aria-label` (PlayPage.timerPausedAria)
 *   - absence of `id` / `style` / `tabindex`
 *
 * What is NOT pinned anywhere: the wrapper element's *tagName*. A
 * refactor that swapped the `<span>` for a `<div>` (or `<output>`,
 * `<time>`, etc.) would silently change inline-flow / baseline
 * alignment in the toolbar without breaking any existing assertion.
 * This test pins `tagName === "SPAN"` so the inline semantics of the
 * timer wrapper can't drift unnoticed.
 *
 * Harness mirrors PlayPageTimerWrapperClass.test.tsx: hoisted fixture
 * plugin for the registry mock + null-stubbed Confetti for jsdom.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-wrapper-tagname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Wrapper TagName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer wrapper tagName test.",
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

describe("PlayPage timer wrapper tagName (W2343)", () => {
  it("renders the play-timer wrapper as a SPAN element while playing", async () => {
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

    const wrapper = screen.getByTestId("play-timer");
    // HTMLElement.tagName always returns the upper-cased tag name for
    // HTML documents, so pinning "SPAN" guarantees the wrapper is a
    // <span> regardless of casing in the JSX source.
    expect(wrapper.tagName).toBe("SPAN");
  });
});

void React;
