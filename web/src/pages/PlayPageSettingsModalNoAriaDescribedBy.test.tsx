/**
 * Unit test for the PlayPage settings modal NOT carrying aria-describedby
 * (W1480).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2251-2260) renders the settings modal as
 *   `<div role="dialog" aria-modal="true" aria-label="${plugin.title} settings"
 *   tabIndex={-1}>`. The modal exposes its accessible name through the
 *   `aria-label` STRING contract and does NOT pair with a separate
 *   `aria-describedby` reference. Its body — toggle/select rows for the
 *   plugin's settings schema — is read by AT users from the dialog
 *   contents themselves; there is no off-screen "description" node for
 *   AT to point at.
 *
 *   Sibling tests already pin the POSITIVE attributes:
 *     - W1423 wrapper className "play-settings-modal"
 *     - role="dialog"
 *     - aria-modal="true"
 *     - aria-label="${plugin.title} settings"
 *     - tabIndex=-1
 *     - W1251 header element <header>
 *     - W1363 title text suffix " settings"
 *     - W1428 backdrop role="presentation"
 *     - W1315/W1447/W1455 close-button shape
 *
 *   None assert the *absence* of aria-describedby. A regression that
 *   added a stale `aria-describedby="..."` pointing at a missing/empty
 *   element would produce a broken AT description (screen readers would
 *   announce nothing, or worse, the wrong node) while every other
 *   attribute test still passed. This test pins the documented contract
 *   that the modal labels itself via `aria-label` and exposes NO
 *   separate description reference. It mirrors the pattern used by
 *   PlayPageInfoPopoverNoAriaDescribedBy (W1472) for the sibling
 *   session-info popover surface.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-no-aria-describedby-fixture";
  const TEST_TITLE = "Settings Modal No Aria-DescribedBy Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the settings modal aria-describedby absence test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin };
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

describe("PlayPage settings modal has no aria-describedby (W1480)", () => {
  it("does not set aria-describedby on the play-settings-modal element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the playing-phase header (with the settings
    // trigger) mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the settings modal.
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const modal = screen.getByTestId("play-settings-modal");
    // Sanity: the positive accessible-name contract is via aria-label, not
    // a label/description reference. Pinning this here keeps the negative
    // assertion meaningful — if the modal ever migrates to
    // aria-labelledby/aria-describedby, this test should be updated, not
    // silently weakened.
    expect(modal.getAttribute("aria-label")).toBe(
      `${hoisted.TEST_TITLE} settings`,
    );
    // The contract: NO aria-describedby is exposed. A regression that
    // added a stale id reference would fail here.
    expect(modal.getAttribute("aria-describedby")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
