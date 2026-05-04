/**
 * Unit test for the PlayPage settings modal — number field label text (W1086).
 *
 * The number branch of the per-game settings modal renders a wrapping
 * `<label>` whose text content is the schema's `field.label`. Existing
 * coverage:
 *   - PlayPage.settingsNumberField (W1056) verifies the input bounds and
 *     value-change behaviour, but never asserts that the schema's label
 *     STRING actually shows up in the DOM.
 *   - PlayPage.settingsBooleanLabel (W1061) is the boolean analog of this
 *     test; this file pins the same invariant for the number branch.
 *   - PlayPage.settingsEnumField (W1043) covers the value/options branch
 *     without asserting the visible label text.
 *
 * If a refactor accidentally dropped `<span class="play-settings-label">
 * {field.label}</span>` from the number branch the input would still
 * "work" (the input is still findable by testid) but the user would see
 * an unlabeled number spinner. This test pins that the schema-declared
 * label string is rendered as visible text inside the number field's
 * `<label>` wrapper, which is the only thing that lets a sighted user
 * know what the number controls.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-num-label-fixture";
  // Use a distinctive label string so the assertion can't accidentally
  // match copy from the modal chrome (header, banner, footer buttons).
  const SETTING_LABEL = "Maximum draw count";
  const settingsSchema = {
    drawCount: {
      kind: "number" as const,
      label: SETTING_LABEL,
      min: 1,
      max: 9,
      step: 1,
      default: 3,
    },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Number Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for number-field label rendering tests.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, SETTING_LABEL, fixturePlugin };
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

describe("PlayPage settings modal number field label text (W1086)", () => {
  it("renders the schema-declared label string next to the number input", async () => {
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

    // The number input is wrapped in a <label> whose visible text is the
    // schema's field.label. Walk up from the input to the wrapping
    // <label> so the assertion is anchored to THIS field's row (and not
    // any incidental occurrence of the same string elsewhere in the
    // modal chrome).
    const input = screen.getByTestId("play-setting-drawCount") as HTMLInputElement;
    const row = input.closest("label");
    expect(row).not.toBeNull();
    expect(row!.textContent).toContain(hoisted.SETTING_LABEL);
  });
});

// Keep the file an unambiguous JSX module under tsconfigs that don't
// auto-inject the React runtime in tests.
void React;
