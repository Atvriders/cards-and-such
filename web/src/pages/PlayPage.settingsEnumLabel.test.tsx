/**
 * Unit test for the PlayPage settings modal — enum field label text (W1087).
 *
 * The enum branch of the per-game settings modal renders a wrapping
 * `<label>` whose first child is `<span class="play-settings-label">
 * {field.label}</span>`, immediately followed by the `<select>` dropdown.
 * Existing coverage:
 *   - PlayPage.settingsEnumField (W1043) verifies the `<select>` exists,
 *     enumerates `field.options`, reflects the schema default, and routes
 *     change events into settings state — but never asserts that the
 *     schema's label STRING is rendered as visible text on the row.
 *   - PlayPage.settingsBooleanLabel (W1061) and PlayPage.settingsNumberLabel
 *     (W1086) pin that same invariant for the boolean and number branches.
 *
 * If a refactor accidentally dropped `<span class="play-settings-label">
 * {field.label}</span>` from the enum branch the dropdown would still
 * "work" (the select is still findable by testid) but a sighted user would
 * see an unlabeled select with no hint of what it controls. This test
 * pins that the schema-declared label string is rendered as visible text
 * inside the enum field's wrapping `<label>`, anchored to THIS field's row
 * so it can't accidentally match modal chrome (header, dirty banner,
 * footer buttons).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-enum-label-fixture";
  // Use a distinctive label string so the assertion can't accidentally
  // match copy from the modal chrome or any of the option values below.
  const SETTING_LABEL = "Choose deck flavor";
  const settingsSchema = {
    deckFlavor: {
      kind: "enum" as const,
      label: SETTING_LABEL,
      options: ["classic", "neon", "retro"] as const,
      default: "classic" as const,
    },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Enum Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for enum-field label rendering tests.",
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

describe("PlayPage settings modal enum field label text (W1087)", () => {
  it("renders the schema-declared label string next to the enum select", async () => {
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

    // The select is wrapped in a <label> whose visible text is the
    // schema's field.label. Walk up from the select to the wrapping
    // <label> so the assertion is anchored to THIS field's row (and not
    // any incidental occurrence of the same string elsewhere in the
    // modal chrome).
    const select = screen.getByTestId("play-setting-deckFlavor") as HTMLSelectElement;
    const row = select.closest("label");
    expect(row).not.toBeNull();
    expect(row!.textContent).toContain(hoisted.SETTING_LABEL);
  });
});

// Keep the file an unambiguous JSX module under tsconfigs that don't
// auto-inject the React runtime in tests.
void React;
