/**
 * Unit test for the PlayPage settings modal — enum field branch (W1043).
 *
 * The modal in PlayPage.tsx has three field branches: boolean, number, and
 * enum (a select dropdown). The boolean branch is exercised by
 * PlayPage.settings / PlayPage.settingsPersist; the enum branch — which
 * renders a `<select>` populated from `field.options` and updates settings
 * via `setSettings` on `change` — was never reached by any existing test.
 *
 * This test mounts a fixture plugin with a single `kind: "enum"` setting,
 * opens the modal, asserts the `<select>` reflects the schema default and
 * lists every declared option, then changes the value and confirms the
 * popover state updates (the select's value moves and the "Restart to
 * apply" dirty banner appears, since the enum value drifted from the
 * snapshot taken at start-of-game).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-enum-fixture";
  const settingsSchema = {
    difficulty: {
      kind: "enum" as const,
      label: "Difficulty",
      options: ["easy", "medium", "hard"] as const,
      default: "easy" as const,
    },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Enum Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings enum-field tests.",
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

describe("PlayPage settings modal enum field (W1043)", () => {
  it("renders a <select> with all options and updates settings on change", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const select = screen.getByTestId("play-setting-difficulty") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    // Reflects the schema default.
    expect(select.value).toBe("easy");
    // All declared options are rendered.
    const optionValues = Array.from(select.options).map((o) => o.value);
    expect(optionValues).toEqual(["easy", "medium", "hard"]);

    // Pre-change: no dirty banner because settings still match the snapshot.
    expect(screen.queryByTestId("play-settings-restart-banner")).toBeNull();

    fireEvent.change(select, { target: { value: "hard" } });

    // The select reflects the new value...
    const selectAfter = screen.getByTestId("play-setting-difficulty") as HTMLSelectElement;
    expect(selectAfter.value).toBe("hard");
    // ...and the mid-game drift surfaces the "Restart to apply" banner,
    // proving the change actually flowed into the settings state.
    expect(screen.getByTestId("play-settings-restart-banner")).toBeTruthy();
  });
});

void React;
