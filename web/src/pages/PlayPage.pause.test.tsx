/**
 * Unit tests for the PlayPage pause / resume behaviour (W578 / W164,
 * targeting the W206 PlayPage component).
 *
 * Two observable behaviours of the in-game pause toggle:
 *
 *   1. Clicking `play-pause-btn` flips the paused state — the button's
 *      `aria-pressed` switches from "false" to "true" and the
 *      `play-paused-overlay` materialises. Clicking again resumes.
 *   2. Pressing Escape (while playing and outside any modal / form
 *      surface) toggles the same paused state, AND the elapsed-time
 *      counter freezes while paused — virtual clock advances by several
 *      seconds without `play-timer-current` budging.
 *
 * Uses `vi.hoisted` so the mocked registry can reference the fixture
 * plugin (vi.mock factories run before module-level const initialisers,
 * so a plain const at top-level would be a TDZ violation). Fake timers
 * are installed AFTER mounting so the start-up effects (initialState,
 * plugin import) commit normally before the timer tick is owned by
 * vitest.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. vi.hoisted runs before vi.mock factories evaluate
// so the closure capture below is safe despite looking like a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "pause-resume-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Pause Resume Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for pause / resume tests.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function mountAndStart(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  // Move past the setup screen so the toolbar (with the Pause button)
  // and the elapsed-time counter mount.
  fireEvent.click(screen.getByTestId("start-game"));
}

describe("PlayPage pause / resume (W578 / W164)", () => {
  it("clicking play-pause-btn toggles paused state and overlay", async () => {
    await mountAndStart();

    const pauseBtn = screen.getByTestId("play-pause-btn");
    // Initially playing — aria-pressed is "false", no overlay rendered.
    expect(pauseBtn.getAttribute("aria-pressed")).toBe("false");
    expect(screen.queryByTestId("play-paused-overlay")).toBeNull();

    // Click to pause — aria-pressed flips and the paused overlay mounts.
    fireEvent.click(pauseBtn);
    expect(pauseBtn.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("play-paused-overlay")).toBeTruthy();

    // Click again to resume — overlay tears down, aria-pressed reverts.
    fireEvent.click(pauseBtn);
    expect(pauseBtn.getAttribute("aria-pressed")).toBe("false");
    expect(screen.queryByTestId("play-paused-overlay")).toBeNull();
  });

  it("Escape pauses (outside modals) and freezes the elapsed timer", async () => {
    await mountAndStart();

    const pauseBtn = screen.getByTestId("play-pause-btn");
    expect(pauseBtn.getAttribute("aria-pressed")).toBe("false");

    // Switch to fake timers AFTER the React tree is committed to playing
    // mode — installing them earlier would freeze the start-phase effects.
    vi.useFakeTimers();

    // Advance the timer ~3s while still playing — the elapsed counter
    // should tick up so the freeze assertion below has something concrete
    // to compare against.
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const timer = screen.getByTestId("play-timer-current");
    const elapsedBeforePause = timer.textContent ?? "";
    expect(elapsedBeforePause).not.toBe("0:00");

    // Escape while focus is on document.body (not an input / textarea /
    // contenteditable) should hit the pause-toggle handler.
    fireEvent.keyDown(window, { key: "Escape" });
    expect(pauseBtn.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("play-paused-overlay")).toBeTruthy();

    // Advance the virtual clock by 5 more seconds — the elapsed counter
    // must NOT change while paused. The 1Hz interval is torn down by the
    // tick effect when `paused` flips true, so vi.advanceTimersByTime
    // should never observe a setElapsed call.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(timer.textContent).toBe(elapsedBeforePause);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
