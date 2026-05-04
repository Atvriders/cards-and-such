/**
 * Unit test for the PlayPage info popover "How to play" link className (W1268).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1759-1770) renders, inside the open session-info
 *   popover when the active plugin defines `howToPlay`, a
 *   `<button class="play-info-link">How to play</button>`. The literal
 *   `play-info-link` class is the CSS contract that styles this in-popover
 *   shortcut distinctly from the dedicated header help-button and from the
 *   sibling `play-info-close` close button. A regression that renamed the
 *   class, dropped it, or merged it into a generic class would silently
 *   break the popover's visual styling for that link while leaving the
 *   text/onClick contracts intact.
 *
 *   Sibling tests cover:
 *     - W1249 PlayPageInfoPopoverCloseClassName: the popover close-button
 *       `play-info-close` class — different element, different class.
 *     - W985 infoPopoverCloseAriaLabel: the close button's aria-label —
 *       no className inspection.
 *     - W984 infoPopoverRole: dialog role on the popover container.
 *
 *   None of them assert the in-popover "How to play" button's className,
 *   leaving the CSS-styling contract for that specific link unpinned.
 *
 * Strategy mirrors PlayPageInfoPopoverCloseClassName.test.tsx (W1249):
 *   - Hoisted minimal fixture plugin with a `howToPlay` string so the
 *     conditional branch that renders the link evaluates truthy.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find the link by accessible name "How to play" and assert its
 *     classList contains `play-info-link` exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-howto-link-classname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover HowTo Link ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover How-to-play link className test.",
    // The conditional `{plugin.howToPlay && (...)}` branch only mounts the
    // link when this string is non-empty, so a non-trivial value is required
    // for the test to exercise the JSX path under inspection.
    howToPlay: "Play the test fixture by doing nothing.",
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

describe("PlayPage info popover How-to-play link className (W1268)", () => {
  it("the in-popover 'How to play' link carries the literal 'play-info-link' class", async () => {
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

    // Open the popover so the in-popover "How to play" link mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeTruthy();

    // Scope the search to the popover container — there are several
    // "How to play" affordances elsewhere on the page (header button,
    // settings-modal footer link). The popover-scoped query disambiguates
    // and pins the in-popover instance specifically.
    const link = popover.querySelector<HTMLButtonElement>("button.play-info-link");
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain("How to play");

    // Pin the literal class — guards against a rename, removal, or merge
    // into a generic shared class that would silently regress styling.
    expect(link!.classList.contains("play-info-link")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
