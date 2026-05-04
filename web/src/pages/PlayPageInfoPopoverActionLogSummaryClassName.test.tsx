/**
 * Unit test for the PlayPage info popover action-log summary className (W1330).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1717-1720) renders, inside the open session-info
 *   popover, a `<details class="play-info-popover-section play-action-log-
 *   details">` whose `<summary>` carries the literal `play-info-label` class
 *   so it visually matches the sibling section labels ("Seed", "Started",
 *   "Plays this session", "Time trend"). That class is the CSS contract
 *   that keeps the disclosure trigger typographically aligned with the rest
 *   of the popover's labels — a regression that renamed the class, dropped
 *   it, or merged it into a generic class would silently break that visual
 *   alignment while leaving the disclosure behavior intact.
 *
 *   Sibling tests cover:
 *     - W1097 infoActionLogExpand: the <summary> opens the <details> on
 *       click, but only asserts `tagName === "SUMMARY"` — does NOT inspect
 *       the className.
 *     - infoPopoverActionLogCollapsed: the <details> element's classes
 *       (`play-info-popover-section play-action-log-details`) — does NOT
 *       reach into the <summary>.
 *     - infoPopoverSeedLabel / infoTimeTrendLabel / etc.: assert the
 *       `play-info-label` class on `<span>` siblings — none touch the
 *       <summary> element.
 *
 *   None of them pin the action-log <summary>'s `play-info-label` class,
 *   leaving that styling contract unguarded.
 *
 * Strategy mirrors PlayPageInfoPopoverCloseClassName.test.tsx (W1249):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Walk from the action-log <ol> (resolved via `play-action-log` testid)
 *     up to its parent <details>, then down to its <summary>, and assert
 *     the className contains `play-info-label`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-action-log-summary-classname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Action-Log Summary ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the action-log summary className test.",
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
// render side-effect-free.
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

describe("PlayPage info popover action-log <summary> className (W1330)", () => {
  it("the action-log <summary> carries the literal 'play-info-label' class", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover so the action-log <details>/<summary> mount.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeTruthy();

    // Resolve the action-log <ol> via its testid, then walk to its parent
    // <details> — the structural anchor for the action-log section.
    const log = screen.getByTestId("play-action-log");
    const details = log.closest("details");
    expect(details).not.toBeNull();

    const summary = details!.querySelector("summary");
    expect(summary).not.toBeNull();
    expect(summary!.tagName).toBe("SUMMARY");

    // Pin the literal class — guards against a rename, removal, or merge
    // into a generic shared class that would silently regress the visual
    // alignment between this disclosure trigger and sibling section labels.
    expect(summary!.classList.contains("play-info-label")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
