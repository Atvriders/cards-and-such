/**
 * Unit test for the PlayPage info popover "How to play" link type attribute (W1696).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1759-1770) renders, inside the open session-info
 *   popover when the active plugin defines `howToPlay`, a
 *   `<button type="button" class="play-info-link">How to play</button>`.
 *   The literal `type="button"` attribute is the contract that prevents the
 *   element from defaulting to `type="submit"` — which would attempt form
 *   submission (and any associated navigation/reload side-effects) if this
 *   button were ever to land inside a `<form>` ancestor (e.g. via a future
 *   refactor that wraps the popover in a form for accessibility tooling).
 *   A regression that drops the `type` attribute would silently downgrade
 *   the click handler to a submit-and-handler combo, potentially causing
 *   page navigation when the link is clicked.
 *
 *   Sibling tests cover:
 *     - W1268 PlayPageInfoPopoverHowToPlayLinkClassName: the link's
 *       `play-info-link` className — different attribute.
 *     - W1249 PlayPageInfoPopoverCloseClassName: the close-button className.
 *     - W1267 PlayPageInfoPopoverCloseType: the close button's type — a
 *       different element with the same attribute name.
 *
 *   None of them assert the in-popover "How to play" button's `type`
 *   attribute, leaving the form-submission-safety contract unpinned.
 *
 * Strategy mirrors PlayPageInfoPopoverHowToPlayLinkClassName.test.tsx (W1268):
 *   - Hoisted minimal fixture plugin with a `howToPlay` string so the
 *     conditional branch that renders the link evaluates truthy.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find the link by `button.play-info-link` and assert its `type`
 *     attribute equals the literal string `"button"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-howto-link-type-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover HowTo Link Type Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover How-to-play link type attr test.",
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

describe("PlayPage info popover How-to-play link type attribute (W1696)", () => {
  it("the in-popover 'How to play' link carries the literal type='button' attribute", async () => {
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

    // Pin the literal type — guards against a regression that drops the
    // attribute, which would let the button default to `type="submit"` and
    // potentially trigger form submission if a form ancestor is ever added.
    expect(link!.getAttribute("type")).toBe("button");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
