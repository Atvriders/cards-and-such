/**
 * Unit test for PlayPage setup-screen plugin content (W1091).
 *
 * What this guards: while `phase === "setup"` and the active plugin has a
 * `howToPlay` string, the setup panel renders the `HowToPlayContent` block
 * — a "How to play" `<h3>` heading followed by the plugin's prose split on
 * paragraph breaks. This is the *only* in-page exposure of how-to-play
 * copy on the setup screen for plugins that opt in, so a regression that
 * dropped the heading or stopped rendering the text would silently strip
 * teaching content from every game's pre-start view.
 *
 * Why this is worth its own test:
 *   - The companion setup test `PlayPage.setupStartLabel` (W1084) only
 *     asserts the Start button label. Nothing in the existing setup
 *     coverage verifies the heading + description rendering contract.
 *   - The split-on-blank-line behaviour means "single paragraph" plugins
 *     and "multi-paragraph" plugins both depend on the same code path.
 *     We pick a single-paragraph fixture so the assertion is unambiguous.
 *
 * Strategy:
 *   - `vi.hoisted` builds a minimal fixture plugin with a known
 *     `howToPlay` string and no settings schema (keeps the panel quiet).
 *   - We assert the setup-panel testid (anchor), the visible `<h3>` "How
 *     to play" heading, and the full description text — the contract
 *     under test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-content-fixture";
  const HOW_TO_PLAY =
    "W1091 fixture description — this prose proves the howToPlay text reaches the setup panel.";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Setup Content Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for setup-screen content rendering test.",
    howToPlay: HOW_TO_PLAY,
    settings: {},
    initialState: (_seed: number, _settings: Record<string, never>) => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, HOW_TO_PLAY, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage setup-screen plugin content (W1091)", () => {
  it("renders the 'How to play' heading and the plugin's howToPlay description", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor: setup panel is mounted while phase === "setup".
    const panel = screen.getByTestId("setup-panel");
    expect(panel).toBeTruthy();

    // Heading contract: HowToPlayContent emits a literal <h3>How to play</h3>.
    const heading = screen.getByRole("heading", { level: 3, name: "How to play" });
    expect(heading.tagName).toBe("H3");
    expect(panel.contains(heading)).toBe(true);

    // Description contract: the plugin's howToPlay string is rendered as
    // visible body text inside the setup panel.
    expect(panel.textContent).toContain(hoisted.HOW_TO_PLAY);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
