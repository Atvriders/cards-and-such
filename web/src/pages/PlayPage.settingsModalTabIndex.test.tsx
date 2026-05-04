/**
 * Unit test for PlayPage settings modal tabIndex={-1} (W998, per W988 note).
 *
 * The settings modal element is programmatically focused by the focus-trap
 * hook when it opens — but a non-interactive <div> is only focusable if it
 * carries `tabindex="-1"`. Without that attribute, `.focus()` is a silent
 * no-op and keyboard users land somewhere unpredictable (or nowhere) when
 * the dialog opens.
 *
 * Sibling tests pin role="dialog" / aria-modal="true" (W988), Esc-close
 * (W730), and the open/close button (W900/W906); this test locks the
 * remaining a11y contract on the modal container itself.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-modal-tabindex-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Modal TabIndex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings modal tabIndex test.",
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

describe("PlayPage settings modal tabIndex (W998)", () => {
  it("the open settings modal exposes tabindex=-1 so it is programmatically focusable", async () => {
    await mountPlaying();

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const modal = screen.getByTestId("play-settings-modal");
    expect(modal.getAttribute("tabindex")).toBe("-1");
  });
});

void React;
