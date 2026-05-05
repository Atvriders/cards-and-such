/**
 * Unit test for the PlayPage info popover close-button type attribute (W1668).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1771-1781) renders, inside the open session-info
 *   popover, a `<button type="button" class="play-info-close" aria-label=
 *   "Close session info">Close</button>`. The literal `type="button"`
 *   attribute is the contract that prevents the close button from being
 *   treated as an implicit submit control if the popover ever ends up
 *   nested inside a `<form>` ancestor (e.g. settings modal, future inline
 *   form). Browsers default `<button>` elements to `type="submit"` when
 *   the attribute is absent, so a regression that dropped the explicit
 *   attribute would silently start submitting an enclosing form on click —
 *   navigating away or POSTing instead of just closing the popover.
 *
 *   Sibling tests cover:
 *     - W985 infoPopoverCloseAriaLabel: aria-label and visible "Close" text.
 *     - W1249 infoPopoverCloseClassName: the literal `play-info-close` class.
 *     - infoPopoverCloseClick: that clicking it dismisses the popover.
 *     - infoPopoverNoAriaDescribedBy / Role / TabIndex: popover-element attrs.
 *
 *   None of them assert the close button's `type` attribute, leaving the
 *   non-submit contract unpinned.
 *
 * Strategy mirrors PlayPageInfoPopoverCloseClassName.test.tsx (W1249):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find the close button by accessible name and assert its `type`
 *     attribute equals the literal string "button".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-type-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close Type Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close type test.",
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

describe("PlayPage info popover close button type (W1668)", () => {
  it("the in-popover close button carries the literal type='button' attribute", async () => {
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

    // Open the popover so the close button mounts on the live surface.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeTruthy();

    // Locate the close button via its specific accessible name (the only
    // signal that disambiguates it from sibling close controls).
    const closeBtn = screen.getByRole("button", { name: "Close session info" });

    // Confirm it really is a <button> element so the type assertion is
    // meaningful (a div with role="button" wouldn't have a `type` slot).
    expect(closeBtn.tagName).toBe("BUTTON");

    // Pin the literal type — guards against an accidental drop of the
    // explicit attribute that would silently revert to the HTML default
    // of `type="submit"`, causing form-ancestor submissions on close.
    expect((closeBtn as HTMLButtonElement).type).toBe("button");
    expect(closeBtn.getAttribute("type")).toBe("button");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
