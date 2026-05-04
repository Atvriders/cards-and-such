/**
 * Unit test for the PlayPage seed-pick popover Daily button type (W1338).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1927) renders the "Daily" action inside the open
 *   seed-pick dialog as `<button type="button" data-testid="play-seed-daily">`.
 *   The explicit `type="button"` is load-bearing: the dialog lives inside
 *   `<header>` markup that other tests confirm has no surrounding `<form>`,
 *   but if a regression ever wrapped the picker in a form (e.g. to leverage
 *   native submit semantics for the seed input), an action button defaulting
 *   to `type="submit"` would silently submit the form on click instead of
 *   applying the daily seed. Pinning `type="button"` guarantees the daily
 *   path stays purely script-driven regardless of any future form wrapper.
 *
 *   Sibling tests cover:
 *     - PlayPage.seedPicker.test.tsx (W205/W324) — the daily button's *click*
 *       behavior (applying `hashStamp(todayStamp())` to the seed display).
 *     - PlayPageSeedPickerRowClassName.test.tsx (W1271) — the inner row class.
 *     - PlayPage.headerSeedPickHaspopup.test.tsx (W1245) — the trigger's
 *       `aria-haspopup` attribute on the closed-state button.
 *
 *   What none of those pin is the daily button's *type* attribute. This test
 *   anchors that single attribute on the rendered daily action so a regression
 *   that drops or renames it (e.g. to default `submit`) is caught immediately.
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
    title: "Klondike (seed-pick daily type fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick daily-button type test.",
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

describe("PlayPage seed-pick dialog Daily button type (W1338)", () => {
  it("renders the Daily action with type='button' inside the open dialog", async () => {
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

    // Open the picker — the daily action only exists once the dialog mounts.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const daily = screen.getByTestId("play-seed-daily");
    // Pin the type exactly so a future regression that drops it (and lets
    // the browser default to `submit`) is caught immediately.
    expect(daily.getAttribute("type")).toBe("button");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
