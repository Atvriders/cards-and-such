/**
 * Unit test for the PlayPage info popover Action log entry *ordering* (W1118).
 *
 * The action-log breadcrumb is appended-to in dispatch order (oldest pushed,
 * newest at the tail of the internal array) but rendered newest-first via a
 * `slice().reverse()` immediately before the `.map(...)` over `<li>`s. That
 * detail is load-bearing for users scanning the popover for "what just
 * happened?" — the most recent action must be visually first.
 *
 * Sibling coverage:
 *   - W716  caps the rolling log at 10 entries.
 *   - W1088 asserts the action-log <details> is closed by default.
 *   - W1097 exercises the expand-on-summary-click affordance.
 *
 * None of the above pin the *order* in isolation: a regression that dropped
 * the `.reverse()` (or swapped to oldest-first) would still pass W716/W1088/
 * W1097. This test fills that gap with a single focused assertion.
 *
 * Strategy:
 *   - Hoisted fixture plugin exposes three buttons — one per distinct action
 *     type — wired directly to the injected `dispatch` prop. The reducer is
 *     a no-op; the action log appends regardless of state changes.
 *   - Advance past setup via `start-game`, then dispatch in known order:
 *     A -> B -> C.
 *   - Open the info popover and read each `<li> <code>` text in the
 *     `play-action-log` <ol>.
 *   - Assert the array equals ["C", "B", "A"] — i.e. newest-first.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. vi.hoisted runs before vi.mock factories evaluate, so the
// closure capture below is safe despite resembling a TDZ pattern. Three
// distinct action types let the test pin the relative order of entries
// without relying on timestamps (which collide on fast jsdom dispatches).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "action-log-order-fixture";
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Action Log Order Fixture",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log ordering tests.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (s: { moves: number }) => s,
    isTerminal: () => null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-alpha"
          type="button"
          onClick={() => dispatch({ type: "alpha" })}
        >
          alpha
        </button>
        <button
          data-testid="fx-bravo"
          type="button"
          onClick={() => dispatch({ type: "bravo" })}
        >
          bravo
        </button>
        <button
          data-testid="fx-charlie"
          type="button"
          onClick={() => dispatch({ type: "charlie" })}
        >
          charlie
        </button>
      </div>
    ),
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
  vi.restoreAllMocks();
});

describe("PlayPage info popover action log entries are newest-first (W1118)", () => {
  it("renders the three dispatched action types in reverse-chronological order", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the fixture's dispatch-wired buttons
    // mount and the info button is reachable.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fx-alpha")).toBeTruthy();

    // Dispatch three distinct action types in known chronological order:
    //   alpha (oldest) -> bravo -> charlie (newest)
    fireEvent.click(screen.getByTestId("fx-alpha"));
    fireEvent.click(screen.getByTestId("fx-bravo"));
    fireEvent.click(screen.getByTestId("fx-charlie"));

    // Open the info popover so the action-log <details> mounts. The <ol>
    // body renders even when <details> is closed by default — only the
    // visual disclosure is gated, not the DOM tree — so we can read the
    // <li> contents without firing a summary click.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Read each entry's <code> text in document order. The source renders
    // newest first via .slice().reverse(), so the visual order pins to:
    //   charlie (most recent) -> bravo -> alpha (oldest).
    const log = screen.getByTestId("play-action-log");
    const codes = Array.from(log.querySelectorAll("li code")).map(
      (el) => el.textContent?.trim() ?? "",
    );
    expect(codes).toEqual(["charlie", "bravo", "alpha"]);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
