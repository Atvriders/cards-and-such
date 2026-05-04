/**
 * Unit test for the PlayPage info popover Action log collapsed default (W1088).
 *
 * The Action-log section is rendered as a native HTML `<details>` element with
 * className `play-info-popover-section play-action-log-details` and a
 * `<summary>` carrying the label "Action log (N)". The existing W208 action-log
 * tests cover entry recording + cap=10 summary count, and W716/W1065 cover the
 * popover's broader section list. Neither asserts the section's *outer*
 * structural shape: it must be a `<details>` element that is **collapsed by
 * default** (no `open` attribute) and carry the `play-action-log-details`
 * class so CSS can style the disclosure widget. A regression that flipped
 * `<details>` to `<details open>` — or refactored it to a non-`<details>`
 * wrapper — would silently expose the debug breadcrumb to every user opening
 * the info popover.
 *
 * Strategy mirrors PlayPage.infoPopoverTimeTrendRow.test.tsx:
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` so the info button
 *     becomes available.
 *   - Open the popover via `play-info-btn` and locate the action-log <ol>'s
 *     parent (the <details>); assert tagName === "DETAILS", that it lacks
 *     the `open` attribute, and that it carries the section + variant
 *     classNames the source promises.
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
  const TEST_GAME_ID = "info-popover-action-log-collapsed-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Action Log Collapsed Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log collapsed-by-default tests.",
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

describe("PlayPage info popover action-log <details> collapsed default (W1088)", () => {
  it("renders the action-log section as a closed <details> with the section + variant classes", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the info button is available and the popover
    // renders its full section list (Seed / Started / Plays / Time trend /
    // Action log).
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover so the action-log <details> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Resolve the action-log <ol> via its testid, then walk to the parent
    // <details>. Using the testid keeps the test resilient to other
    // structural tweaks (e.g. wrapping the <ol> in another scroll container)
    // while still pinning the outer disclosure shape.
    const log = screen.getByTestId("play-action-log");
    const details = log.closest("details");
    expect(details).not.toBeNull();
    expect(details!.tagName).toBe("DETAILS");

    // Collapsed by default: <details> without an `open` attribute is
    // user-agent-closed, hiding the debug breadcrumb until clicked.
    expect(details!.hasAttribute("open")).toBe(false);

    // ClassName carries both the shared section class (so the popover styles
    // every section uniformly) and the variant class (so the disclosure
    // widget gets its own CSS hooks).
    expect(details!.classList.contains("play-info-popover-section")).toBe(true);
    expect(details!.classList.contains("play-action-log-details")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
