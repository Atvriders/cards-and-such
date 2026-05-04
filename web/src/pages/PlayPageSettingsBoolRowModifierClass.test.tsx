/**
 * Unit test for PlayPage settings boolean toggle row modifier className (W1508).
 *
 * In the in-game settings modal, the boolean field branch renders the
 * row as `<label className="play-settings-row play-settings-row--bool">`
 * (PlayPage.tsx ~line 2293). The `play-settings-row--bool` BEM modifier
 * is the styling hook that lets boolean rows lay out the visible label
 * + toggle differently from `<label class="play-settings-row">` rows
 * used by the number / enum branches (which omit the modifier).
 *
 * What is already pinned:
 *   - W1494 (`PlayPageSettingsToggleThumbAria`) pins the decorative
 *     thumb span's class + aria-hidden but never inspects the wrapping
 *     `<label>` row's class list.
 *   - W1061 (`PlayPage.settingsBooleanLabel`) pins the schema label
 *     text content of the row but never its className.
 *   - W1142 (`PlayPage.setupSettingsBooleanRowClass`) pins the
 *     setup-screen `SettingsForm` boolean row's `boolean` class — a
 *     completely different component (`platform/game-plugin/settings.tsx`).
 *
 * If a refactor dropped the `--bool` modifier (or replaced the BEM
 * naming convention), every game's modal CSS that targets
 * `.play-settings-row--bool` would silently lose its boolean-specific
 * layout. No current test catches that.
 *
 * Strategy mirrors W1494: a vi.hoisted minimal fixture plugin with a
 * single boolean field, mount PlayPage, click `start-game`, open the
 * settings modal via `play-settings-btn`, walk up from the boolean
 * field's testid to its wrapping `<label>`, and assert it carries both
 * the base `play-settings-row` class and the `--bool` modifier.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-bool-row-modifier-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Bool Row Modifier Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for settings modal boolean row modifier class.",
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

vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage settings boolean row modifier className (W1508)", () => {
  it("wraps a boolean field in a <label> carrying both 'play-settings-row' and '--bool'", async () => {
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

    // Walk up from the boolean field input's testid to the wrapping
    // <label>. Anchoring on the input keeps the assertion scoped to the
    // boolean row (and not any unrelated `.play-settings-row` that a
    // refactor might add elsewhere on the page).
    const checkbox = screen.getByTestId(
      "play-setting-deluxe",
    ) as HTMLInputElement;
    const row = checkbox.closest("label");
    expect(row).not.toBeNull();
    expect(row!.tagName).toBe("LABEL");
    // Pin the base class — keeps the row sharing the same structural
    // styling hook as number / enum rows.
    expect(row!.classList.contains("play-settings-row")).toBe(true);
    // Pin the BEM modifier — the boolean-specific styling hook.
    expect(row!.classList.contains("play-settings-row--bool")).toBe(true);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
