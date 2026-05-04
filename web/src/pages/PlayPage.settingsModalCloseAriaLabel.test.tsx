/**
 * Unit test for PlayPage settings modal close button aria-label (W1003).
 *
 * Sibling tests cover the dialog wrapper itself: W988 pins
 * `role="dialog"` + `aria-modal="true"`, W997 pins the modal's
 * `aria-label`. The dismiss control inside that dialog is an icon-only
 * button (an SVG "X" with `aria-hidden="true"`), so without an explicit
 * `aria-label` screen readers would announce it as just "button" with no
 * accessible name. This test locks that contract:
 *
 *   - the button at `data-testid="play-settings-close"` exposes
 *     `aria-label="Close settings"`
 *
 * Without this assertion, a refactor that drops the aria-label or
 * relabels it inconsistently (e.g. "Close" vs "Close settings") would
 * silently break the dismiss affordance for assistive tech.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-close-aria-label-fixture";
  const TEST_TITLE = "Settings Modal Close Aria-Label Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for settings modal close button aria-label test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin, settingsSchema };
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

async function mountPlaying(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId("start-game"));
}

describe("PlayPage settings modal close button aria-label (W1003)", () => {
  it("the close button exposes aria-label='Close settings'", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const closeBtn = screen.getByTestId("play-settings-close");
    expect(closeBtn.getAttribute("aria-label")).toBe("Close settings");
  });
});

void React;
