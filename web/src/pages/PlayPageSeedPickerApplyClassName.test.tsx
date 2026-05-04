/**
 * Unit test for the PlayPage seed-pick dialog Apply action className (W1391).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1941) renders the "Apply" action inside the open
 *   seed-pick dialog as
 *     `<button type="button"
 *              className="play-seed-picker-action play-seed-picker-apply"
 *              data-testid="play-seed-apply">`.
 *   Apply is the *primary* action of the dialog — it carries the shared
 *   `play-seed-picker-action` base class (sibling to Random/Daily) **plus**
 *   the `play-seed-picker-apply` modifier that bumps it to the prominent
 *   primary-button style defined in PlayPage.css (~line 461). A regression
 *   that dropped the modifier — or replaced the compound className with
 *   just the bare base class — would silently demote Apply to a secondary
 *   look while still passing the existing tests:
 *
 *     - PlayPage.seedPickApply.test.tsx (W1023) — pins Apply's *click*
 *       behavior (commits the draft, closes the popover) but never asserts
 *       its className.
 *     - PlayPageDailyBtnClassName.test.tsx (W1368) — pins the *Daily*
 *       button's bare className and only mentions the Apply modifier in
 *       a comment.
 *     - PlayPageSeedPickerRowClassName.test.tsx (W1271) — pins the row
 *       wrapper class.
 *
 *   None of those anchor the Apply button's *own* className. This test
 *   pins exactly that compound attribute so a styling regression on the
 *   primary apply action is caught at the unit level.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — uses id "klondike" so the seed-pick toolbar branch
// (gated to klondike/freecell/spider via `showProminentSeed`) renders.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (seed-pick apply className fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the apply-button className test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number): State => ({ seed }),
    reducer: (s: State): State => s,
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
  // Pre-mark the klondike tutorial as seen so the first-run coachmark
  // doesn't intercept the seed-pick click.
  localStorage.setItem(
    "cards-tutorial-seen",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: true }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage seed-pick dialog Apply button className (W1391)", () => {
  it("renders Apply with className 'play-seed-picker-action play-seed-picker-apply'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Seed-pick button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker — the apply action only exists once the dialog mounts.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const apply = screen.getByTestId("play-seed-apply");
    // Pin the compound className exactly. Apply must carry both the shared
    // base class (so it sizes/aligns with its Random/Daily siblings) *and*
    // the `play-seed-picker-apply` modifier (so it gets the primary-action
    // styling). Dropping either one is a visual regression.
    expect(apply.className).toBe("play-seed-picker-action play-seed-picker-apply");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
