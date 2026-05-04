/**
 * Unit test for the PlayPage header seed-pick button UI contract (W976).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1843) renders a `<button data-testid="play-seed-pick-btn">`
 *   in the header iconbar whenever `phase === "playing"`. The button toggles
 *   the seed-picker dialog (W205/W324). It is `type="button"` (so a stray
 *   wrapping form can never submit), it carries an aria-label of "Pick seed",
 *   a `data-tooltip="Pick seed"` so the shared tooltip layer can hover-reveal
 *   it, and it shows a visible cog/seed glyph SVG.
 *
 *   The W962 audit listed `seed-pick` as one of the data-tooltip-bearing
 *   buttons. Sibling `PlayPage.seedPicker.test.tsx` (W205/W324) covers the
 *   *interactive* paths through the popover (Random / Daily / Apply), but
 *   nothing pins the button's *visible UI attributes* — so a regression
 *   that swapped the aria-label, set `type="submit"`, dropped the
 *   data-tooltip, or replaced the inline SVG with a text glyph would slip
 *   past every existing test.
 *
 * Strategy mirrors PlayPage.headerHintButton.test.tsx (W922) and
 * PlayPage.seedPicker.test.tsx (W205/W324):
 *   - vi.hoisted defines a fixture plugin under id "klondike" so the
 *     surrounding `seed-display` branch (gated to klondike/freecell/spider
 *     by `showProminentSeed`) also renders, matching the expected
 *     "seed-display games" UX context the W962 audit covered.
 *   - Pre-seed `cards-tutorial-seen` for the klondike id so the first-run
 *     coachmark doesn't intercept focus / clicks before we read the button.
 *   - Mount at `/play/:gameId?seed=42`, click start-game to enter playing.
 *   - Locate the button via its testid.
 *   - Pin four static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Pick seed" (screen-reader contract).
 *       4. data-tooltip === "Pick seed" (W962 hover-tooltip contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate. The
// fixture plugin uses id "klondike" so the prominent seed-display branch
// (gated to klondike/freecell/spider) renders, matching the seed-display
// games context the seed-pick button is conceptually paired with.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (seed-pick btn fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header seed-pick button UI test.",
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
  // doesn't intercept the button before we can inspect it. The platform
  // module persists this as a JSON map keyed by gameId under
  // `cards-tutorial-seen`.
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

describe("PlayPage header seed-pick button UI contract (W976)", () => {
  it("renders a <button type='button'> with the 'Pick seed' a11y label and data-tooltip", async () => {
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

    const btn = screen.getByTestId("play-seed-pick-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract — the aria-label is the static "Pick seed"
    // string. The button has no visible text label (icon-only), so the
    // aria-label is the only accessible name.
    expect(btn.getAttribute("aria-label")).toBe("Pick seed");

    // W962 tooltip contract — the shared tooltip layer reads
    // `data-tooltip` to render a hover/focus tooltip for icon-only
    // buttons. Removing this attribute would silently break the
    // hover-reveal UX while a11y stayed green.
    expect(btn.getAttribute("data-tooltip")).toBe("Pick seed");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
