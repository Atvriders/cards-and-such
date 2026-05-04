/**
 * Unit test for the PlayPage info popover wrapper className (W1465).
 *
 * The info popover is rendered as a `<div>` carrying
 * `className="play-info-popover"` — the wrapper class drives the
 * popover's positioning, surface styling, and serves as the CSS
 * scoping root for descendant selectors (e.g. `.play-info-popover-row`,
 * `.play-info-popover-section`, `.play-info-label`). Sibling tests pin
 * `data-testid="play-info-popover"` (the testid handle), `role="dialog"`
 * (W1419 family), `aria-modal`, `aria-label`, `tabIndex={-1}`, and the
 * close-button className (W1249), but none of them assert the wrapper's
 * own className. A regression that renamed the class (e.g. dropped the
 * `play-` prefix or swapped to a styled-component slot) would slip past
 * the existing suite while breaking every CSS rule scoped under it.
 *
 * Strategy:
 *   - Render PlayPage with a minimal fixture plugin and enter the
 *     playing phase so the info button is visible.
 *   - Click the info button to open the popover.
 *   - Resolve the popover via its testid, then assert the wrapper
 *     element's `classList` contains exactly `"play-info-popover"`.
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
  const TEST_GAME_ID = "info-popover-wrapper-classname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Wrapper ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for popover wrapper className tests.",
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

describe("PlayPage info popover wrapper className (W1465)", () => {
  it("renders the popover wrapper div with className 'play-info-popover'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the info button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    // Resolve the popover wrapper and assert its className.
    const popover = screen.getByTestId("play-info-popover");
    expect(popover.tagName).toBe("DIV");
    expect(popover.classList.contains("play-info-popover")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
