/**
 * Unit test for the PlayPage info popover close-button aria-label (W985).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1771-1781) renders, inside the open session-info
 *   popover, a `<button class="play-info-close" aria-label="Close session
 *   info">Close</button>` whose visible text is the generic word "Close" but
 *   whose accessible name is the more specific "Close session info". For AT
 *   users the explicit aria-label is the only signal that disambiguates this
 *   close affordance from the many other "Close" controls on the page (the
 *   settings modal close, banner dismissals, etc.). A regression that
 *   dropped the attribute, swapped it to a generic "Close", or pointed at
 *   the wrong surface would silently degrade screen-reader navigation while
 *   the visible UI looked unchanged.
 *
 *   Sibling tests cover:
 *     - W975 headerInfoAriaExpanded: trigger-button dynamic aria-expanded.
 *     - W984 infoPopoverRole: the popover element's role="dialog" attribute.
 *     - infoSeedShown / infoSessionCounter / actionLog: popover *contents*.
 *
 *   None of them inspect the in-popover close button at all, leaving its
 *   accessible-name contract unpinned.
 *
 * Strategy mirrors PlayPage.infoPopoverRole.test.tsx (W984):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Find the close button by its explicit aria-label and assert both the
 *     attribute and the visible "Close" text — pinning the dual contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-aria-label-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close ARIA Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close aria-label test.",
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

describe("PlayPage info popover close button aria-label (W985)", () => {
  it("the in-popover close button exposes aria-label=\"Close session info\" with visible \"Close\" text", async () => {
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

    // Open the popover.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    // Confirm the popover mounted so we are inspecting the live surface.
    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeTruthy();

    // Locate the close button by its specific accessible name. Using
    // getByRole("button", { name: ... }) here doubles as a regression
    // probe: testing-library matches against the computed accessible name,
    // so a regression that dropped aria-label would either fail the lookup
    // or surface a different name (e.g. the visible "Close").
    const closeBtn = screen.getByRole("button", { name: "Close session info" });

    // Pin the attribute exactly — guards against reverting to a generic
    // "Close" or other ambiguous label that overlaps with sibling close
    // controls (settings modal, banner dismiss, etc.).
    expect(closeBtn.getAttribute("aria-label")).toBe("Close session info");
    // Visible text must remain the short "Close" so sighted-user UI is
    // unchanged; the aria-label is purely the AT-only specialization.
    expect(closeBtn.textContent).toBe("Close");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
