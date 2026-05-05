/**
 * W2002 — focused coverage of the PlayPage `<h2>` element count in the
 * default playing phase reached via a raw, document-level
 * `querySelectorAll("h2")` lookup.
 *
 * PlayPage.tsx renders exactly three literal `<h2>` tags in source:
 *   1. `.play-settings-modal-title` — gated on `settingsModalOpen`.
 *   2. `.win-banner-title`           — gated on `isWin && phase === "ended"`.
 *   3. `.loss-banner-title`          — gated on `isLoss && phase === "ended"`.
 *
 * In the default playing phase — immediately after clicking the setup
 * `start-game` button, with no settings modal open and no terminal
 * win/loss reached — none of those gates fire. The page-title heading
 * itself is an `<h1>` (pinned by W1951), and all in-game content uses
 * lower-level headings or non-heading semantic tags. Therefore the
 * document-level `querySelectorAll("h2")` should return ZERO nodes.
 *
 * This pin guards against accidental regressions that:
 *   - Promote a stage label (e.g. "Stock", "Foundation") to an `<h2>`,
 *     which would silently grow the document outline mid-game.
 *   - Forget to gate the settings modal `<h2>` and leak it into the
 *     base page tree.
 *   - Render a sentinel/placeholder `<h2>` for screen readers without
 *     wrapping it in the same conditional as the win/loss banners.
 *
 * Strategy mirrors PlayPageH1Tag.test.tsx (hoisted-fixture pattern):
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
  const TEST_GAME_ID = "h2-count-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "H2 Count Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2002 h2-count test.",
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

describe("PlayPage h2 count in default playing phase (W2002)", () => {
  it("renders zero <h2> elements via document-level querySelectorAll('h2')", async () => {
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

    // Pin via the SAME unscoped selector path the W2002 sibling tests use.
    // Default playing phase has no settings modal, no win banner, and no
    // loss banner — so zero literal <h2> nodes should be in the document.
    const h2s = document.querySelectorAll("h2");
    expect(h2s.length === 0).toBe(true);
  });
});

void React;
