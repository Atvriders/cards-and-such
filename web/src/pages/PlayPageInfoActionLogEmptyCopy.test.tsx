/**
 * Unit test for the PlayPage info popover action-log empty-state copy
 * (W1379).
 *
 * The action-log section under the info popover renders an empty-state
 * placeholder `<li>` when `actionLog.length === 0`. The placeholder copy
 * is the literal string "No actions yet." — exact wording matters because
 * it is the only user-visible signal that the rolling breadcrumb is
 * intentionally empty (vs. failing to mount). Existing tests in the
 * action-log family pin the `<details>` / `<summary>` structure
 * (W1088 collapsed default), the section className (W1330), the expand
 * mechanic (W1097), and the entry list contents (W208 / W1118), but
 * none of them assert the empty-state copy itself. A regression that
 * dropped the <li>, swapped its text to "(empty)", or wrapped it in an
 * extra element would slip past the existing suite.
 *
 * Strategy:
 *   - Render PlayPage with a fixture plugin that never dispatches actions
 *     so `actionLog` stays empty.
 *   - Open the info popover and force the action-log <details> open so
 *     the <ol> body is reachable.
 *   - Resolve the action-log <ol> via `data-testid="play-action-log"`,
 *     find its single <li> child, and assert its `textContent` equals
 *     the literal "No actions yet." (with surrounding whitespace
 *     trimmed to tolerate harmless JSX whitespace).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — vi.hoisted runs before vi.mock factories evaluate,
// so the closure capture below is safe despite resembling a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-empty-copy-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Empty Copy Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log empty-state copy tests.",
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
  vi.restoreAllMocks();
});

describe("PlayPage info popover action-log empty-state copy (W1379)", () => {
  it("renders the literal 'No actions yet.' placeholder when the action log is empty", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the info button is available and the
    // action-log section mounts inside the popover.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover so the <details> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Resolve the action-log <ol> via its testid, then force the parent
    // <details> open so the body <li> is reachable. (jsdom does not
    // always synthesize the native summary-click -> toggle path, so
    // mirror the browser by flipping `open` and dispatching `toggle`.)
    const log = screen.getByTestId("play-action-log");
    const details = log.closest("details") as HTMLDetailsElement | null;
    expect(details).not.toBeNull();
    details!.open = true;
    fireEvent(details!, new Event("toggle"));

    // The empty <ol> should contain exactly one <li> — the placeholder.
    const items = log.querySelectorAll("li");
    expect(items.length).toBe(1);

    // Trim to tolerate harmless JSX-whitespace; the literal copy is
    // load-bearing for users so the equality check is exact.
    expect((items[0]!.textContent ?? "").trim()).toBe("No actions yet.");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
