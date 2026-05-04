/**
 * Unit test for PlayPage settings modal backdrop role (W1428).
 *
 * Sibling tests cover the settings backdrop's click-to-close behaviour
 * (settingsBackdropClick / settingsOutsideClick) and the dialog wrapper's
 * role="dialog" (settingsModalRole), but none of them assert that the
 * outer `play-settings-backdrop` scrim itself carries `role="presentation"`.
 * That role is what tells assistive tech to ignore the wrapper as a
 * landmark and treat it purely as a decorative click-trap surface — drop
 * it (or change it to e.g. role="dialog") and AT users get an extra
 * spurious landmark stacked on top of the real dialog.
 *
 * The matching pin already exists for the win-banner backdrop
 * (PlayPageEndBannerBackdropRole.test.tsx); this test extends the same
 * contract to the settings modal scrim.
 *
 * Strategy mirrors PlayPageSettingsModalHeaderEl.test.tsx:
 *   - vi.hoisted fixture plugin so /play/:gameId mounts deterministically.
 *   - Click `start-game`, then `play-settings-btn` to open the modal.
 *   - Assert the element with `data-testid="play-settings-backdrop"` has
 *     `role="presentation"` exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-backdrop-role-fixture";
  const TEST_TITLE = "Settings Backdrop Role Fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings backdrop role test.",
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

describe("PlayPage settings modal backdrop role (W1428)", () => {
  it("the .play-settings-backdrop scrim has role=\"presentation\"", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const backdrop = screen.getByTestId("play-settings-backdrop");
    expect(backdrop.getAttribute("role")).toBe("presentation");
  });
});

void React;
