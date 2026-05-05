/**
 * W2011 — focused coverage of the PlayPage `<h1>` element count in the
 * default playing phase reached via a raw, document-level
 * `querySelectorAll("h1")` lookup.
 *
 * PlayPage.tsx renders exactly one literal `<h1>` tag in source — the
 * `.play-header-titlerow` page title `<h1>{plugin.title}</h1>` (~line
 * 1673). No other `<h1>` is conditionally or unconditionally mounted
 * elsewhere on the page (the win/loss banners use `<h2>`, settings
 * modal uses `<h2>`, and all in-game labels are lower-level headings
 * or non-heading semantic tags).
 *
 * Sibling W1951 (PlayPageH1Tag) pins that the FIRST h1 found by
 * `document.querySelector("h1")` is a real <h1> tagName. Sibling
 * W896-class tests pin the scoped `.play-header-titlerow h1` selector.
 * Sibling W2002 (PlayPageH2Count) pins the document-level h2 count at
 * zero in the default playing phase.
 *
 * No existing test pins the literal *h1 count* across the whole
 * document via `querySelectorAll("h1")`. A regression that accidentally
 * rendered a second <h1> elsewhere (e.g. promoting a stage label,
 * leaking a sentinel/placeholder `<h1>` for screen readers, or
 * duplicating the title block) would slip past the
 * `querySelector("h1")` (returns FIRST) and the scoped `.play-header-titlerow h1`
 * checks while still producing a valid render. This test fills that
 * gap with a single document-level `querySelectorAll("h1").length === 1`
 * assertion, complementing W1951's tagName pin to fully lock the
 * document-outline primary-heading invariant.
 *
 * Strategy mirrors PlayPageH2Count.test.tsx (hoisted-fixture pattern):
 *   - vi.hoisted fixture plugin so the vi.mock factory captures it.
 *   - Confetti null-stub — jsdom lacks canvas APIs Confetti reaches for.
 *   - Mount at `/play/:gameId` then click `start-game` to enter the
 *     "playing" phase. No further interaction; no banner/modal opened.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "h1-count-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "H1 Count Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2011 h1-count test.",
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

describe("PlayPage h1 count in default playing phase (W2011)", () => {
  it("renders exactly one <h1> element via document-level querySelectorAll('h1')", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Transition out of "setup" into the default "playing" phase. No
    // banners, no modals, no terminal state — just the live HUD + game.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Pin via an unscoped, document-level selector path. The default
    // playing phase has exactly one literal `<h1>` — the page title
    // heading in `.play-header-titlerow`.
    const h1s = document.querySelectorAll("h1");
    expect(h1s.length === 1).toBe(true);
  });
});

void React;
