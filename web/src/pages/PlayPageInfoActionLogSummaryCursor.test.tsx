/**
 * Unit test for the PlayPage info popover action-log <summary> inline
 * cursor style (W1477).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1718) renders the action-log disclosure trigger
 *   as `<summary className="play-info-label" style={{ cursor: "pointer" }}>`.
 *   The inline `cursor: "pointer"` is the affordance that tells users the
 *   <summary> is clickable even before they hover — without it the default
 *   browser cursor would be `default` since the inherited `play-info-label`
 *   class doesn't itself set a cursor. A regression that drops the inline
 *   style or replaces it with a non-pointer value would silently degrade
 *   discoverability of the disclosure control.
 *
 *   Adjacent tests cover:
 *     - W1330 (PlayPageInfoPopoverActionLogSummaryClassName): pins the
 *       <summary>'s `play-info-label` class — does NOT touch the inline
 *       style.
 *     - W1097 (infoActionLogExpand): asserts the <summary> opens the
 *       <details> on click — does NOT inspect any styles.
 *     - infoPopoverActionLogCollapsed: pins the <details> classes — does
 *       NOT reach into the <summary>'s style attribute.
 *
 * Strategy mirrors PlayPageInfoPopoverActionLogSummaryClassName.test.tsx:
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Walk from the action-log <ol> (resolved via `play-action-log` testid)
 *     up to its parent <details>, then down to its <summary>, and assert
 *     `summary.style.cursor === "pointer"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-action-log-summary-cursor-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Action-Log Summary Cursor Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the action-log summary cursor style test.",
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

describe("PlayPage info popover action-log <summary> cursor (W1477)", () => {
  it("the action-log <summary> carries inline `cursor: pointer`", async () => {
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

    const summary = details!.querySelector("summary") as HTMLElement | null;
    expect(summary).not.toBeNull();
    expect(summary!.tagName).toBe("SUMMARY");

    // Pin the inline cursor affordance — guards against a regression that
    // drops the inline style or replaces it with a non-pointer value.
    expect(summary!.style.cursor).toBe("pointer");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
