/**
 * Unit test for the PlayPage settings modal — number field branch (W1056).
 *
 * The modal in PlayPage.tsx has three field branches: boolean, number, and
 * enum (a select dropdown). The boolean branch is exercised by
 * PlayPage.settings / PlayPage.settingsPersist; the enum branch is covered by
 * PlayPage.settingsEnumField (W1043). The number branch — which renders an
 * `<input type="number">` with min/max/step bounds and parses the change
 * value through `Number(...)` — was never reached by any existing test.
 *
 * This test mounts a fixture plugin with a single `kind: "number"` setting,
 * opens the modal, asserts the input reflects the schema default and
 * carries the declared min/max/step attributes, then changes the value and
 * confirms the popover state updates (the input value moves and the
 * "Restart to apply" dirty banner appears, since the number drifted from
 * the snapshot taken at start-of-game).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-number-fixture";
  const settingsSchema = {
    rounds: {
      kind: "number" as const,
      label: "Rounds",
      min: 5,
      max: 50,
      step: 5,
      default: 15,
    },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Number Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings number-field tests.",
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

describe("PlayPage settings modal number field (W1056)", () => {
  it("renders an <input type=number> with bounds and updates settings on change", async () => {
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

    const input = screen.getByTestId("play-setting-rounds") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("number");
    // Reflects the schema default.
    expect(input.value).toBe("15");
    // Carries declared min/max/step bounds.
    expect(input.min).toBe("5");
    expect(input.max).toBe("50");
    expect(input.step).toBe("5");

    // Pre-change: no dirty banner because settings still match the snapshot.
    expect(screen.queryByTestId("play-settings-restart-banner")).toBeNull();

    fireEvent.change(input, { target: { value: "25" } });

    // The input reflects the new value...
    const inputAfter = screen.getByTestId("play-setting-rounds") as HTMLInputElement;
    expect(inputAfter.value).toBe("25");
    // ...and the mid-game drift surfaces the "Restart to apply" banner,
    // proving the change actually flowed into the settings state.
    expect(screen.getByTestId("play-settings-restart-banner")).toBeTruthy();
  });
});

void React;
