/**
 * Unit test for PlayPage settings modal ARIA role/aria-modal (W988).
 *
 * Sibling tests cover Esc-close (W730), the open/close button (W900/W906),
 * and round-trip persistence — but none assert that the modal element
 * itself is exposed to assistive tech as a modal dialog. This test pins
 * those two attributes:
 *
 *   - `role="dialog"`        (so screen readers announce it as a dialog)
 *   - `aria-modal="true"`    (so they treat content outside as inert)
 *
 * Regressions here would silently break keyboard/screen-reader users, so
 * we lock the contract with a minimal fixture mirroring the sibling tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-role-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal role/aria-modal test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin, settingsSchema };
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

describe("PlayPage settings modal role/aria-modal (W988)", () => {
  it("the open settings modal exposes role=dialog and aria-modal=true", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const modal = screen.getByTestId("play-settings-modal");
    expect(modal.getAttribute("role")).toBe("dialog");
    expect(modal.getAttribute("aria-modal")).toBe("true");
  });
});

void React;
