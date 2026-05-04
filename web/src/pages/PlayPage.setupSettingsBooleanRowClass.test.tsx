/**
 * Unit test for SettingsForm boolean-field row wrapper className (W1142).
 *
 * What this guards: inside `SettingsForm`
 * (`web/src/platform/game-plugin/settings.tsx`) the boolean branch wraps
 * its checkbox + visible label in a `<label key={key} className="boolean">`
 * — note this is the ONLY branch (number / enum) that adds a class to the
 * row wrapper. The `boolean` class is a styling hook used by every game's
 * setup CSS to lay out checkbox rows differently from the number / enum
 * rows (which render `<span>{label}</span><input/>` while the boolean
 * branch renders `<input/><span>{label}</span>` with the box first).
 *
 * Why this is worth its own test:
 *   - W1135 (`PlayPage.setupSettingsFormElement`) pins that the
 *     `<form className="settings-form">` wrapper is a `<form>` with the
 *     correct class, but never inspects any field row inside.
 *   - W727 (`PlayPage.setupSettingsApplied`) verifies the *behaviour* of
 *     toggling a setup-screen boolean (changes flow into `initialState`),
 *     but only locates the input via `getByLabelText("Deluxe")` — it never
 *     asserts the wrapping element's tag or class.
 *   - W1061 (`PlayPage.settingsBooleanLabel`) covers boolean label text in
 *     the in-game *modal*, not the setup-screen `SettingsForm`, and does
 *     not check `className`.
 *   - The number/enum branches deliberately omit the `boolean` class — if
 *     a refactor accidentally moves the class onto every row (or drops it
 *     from the boolean branch), the only signal would be a broken setup
 *     layout in production. No current test would catch it.
 *
 * Strategy:
 *   - Reuse the same minimal-fixture pattern as the other setup tests
 *     (W727, W1135) with a single boolean setting.
 *   - Anchor on `setup-panel` so we are unambiguously inside the
 *     setup-screen `SettingsForm` (not any other label.boolean elsewhere).
 *   - Walk up from the schema-labelled checkbox to its wrapping `<label>`
 *     and assert `tagName === "LABEL"` and `classList.contains("boolean")`.
 *     Walking from the input avoids picking up any unrelated `.boolean`
 *     element a future refactor might add to the panel.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-boolean-row-class-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Setup Settings Boolean Row Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for setup-screen SettingsForm boolean row className.",
    settings: settingsSchema,
    initialState: (_seed: number, _settings: { deluxe: boolean }) => ({ moves: 0 }),
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
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("SettingsForm boolean field row wrapper className (W1142)", () => {
  it("wraps a boolean setting's checkbox in a <label class=\"boolean\"> on the setup screen", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor on the setup panel so the assertion is unambiguously scoped to
    // the setup-screen SettingsForm (not any other DOM that might use
    // `.boolean` elsewhere on the page).
    const panel = screen.getByTestId("setup-panel");
    expect(panel).toBeTruthy();

    // Resolve the boolean input via its accessible label, then walk up to
    // its wrapping <label>. SettingsForm's boolean branch renders:
    //   <label key={key} className="boolean">
    //     <input type="checkbox" ... />
    //     <span>{field.label}</span>
    //   </label>
    const checkbox = screen.getByLabelText("Deluxe") as HTMLInputElement;
    expect(checkbox.type).toBe("checkbox");

    const row = checkbox.closest("label");
    expect(row).not.toBeNull();
    expect(row!.tagName).toBe("LABEL");
    expect(row!.classList.contains("boolean")).toBe(true);

    // And it must live inside the setup panel's settings-form (not, e.g.,
    // some other label.boolean a refactor might add to the page chrome).
    expect(panel.contains(row)).toBe(true);
    expect(row!.closest("form.settings-form")).not.toBeNull();
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
