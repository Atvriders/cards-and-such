/**
 * Unit test for the PlayPage in-game settings modal footer wrapper
 * element (W1089, follow-up to W1071 which covered the "How to play"
 * footer button click behaviour).
 *
 * The settings dialog wraps its action buttons in a semantic
 * `<footer class="play-settings-footer">` element. Existing tests
 * exercise the individual footer buttons (`play-settings-reset`,
 * `play-settings-howto`) but none assert that the structural wrapper
 * is a real `<footer>` landmark with the documented class — that
 * matters for both styling hooks and assistive-tech navigation by
 * landmark, so locking it in keeps a regression from silently
 * downgrading the markup to a `<div>`.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with one boolean setting AND
 *     a `howToPlay` string so both footer buttons render — that way the
 *     test sees the footer in its fully-populated shape.
 *   - The plugin is mocked into `../games/registry.js` so PlayPage
 *     resolves it without dragging in the real registry / lazy game
 *     imports.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-footer-element-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Footer Element Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the settings modal footer wrapper.",
    howToPlay: "Pretend rules so both footer buttons render.",
    settings: settingsSchema,
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings modal footer wrapper element (W1089)", () => {
  it("wraps footer actions in a <footer class=\"play-settings-footer\"> element containing the reset + howto buttons", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // The footer only exists while the settings modal is mounted.
    fireEvent.click(screen.getByTestId("play-settings-btn"));
    const modal = screen.getByTestId("play-settings-modal");

    // The wrapper itself: a real <footer> landmark with the documented
    // class. Querying via the modal scope avoids matching any unrelated
    // page-level footer that might get added later.
    const footer = modal.querySelector("footer.play-settings-footer");
    expect(footer).toBeTruthy();
    expect(footer?.tagName).toBe("FOOTER");

    // Both action buttons live inside that wrapper — locking the
    // containment relationship, not just the existence of either side.
    const resetBtn = screen.getByTestId("play-settings-reset");
    const howtoBtn = screen.getByTestId("play-settings-howto");
    expect(footer?.contains(resetBtn)).toBe(true);
    expect(footer?.contains(howtoBtn)).toBe(true);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
