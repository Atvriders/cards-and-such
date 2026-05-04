/**
 * Unit test for SettingsForm enum-field row wrapper className (W1155).
 *
 * Analog of W1142 (boolean row class) and W1149 (number row class) for the
 * enum branch.
 *
 * What this guards: inside `SettingsForm`
 * (`web/src/platform/game-plugin/settings.tsx`) the enum branch wraps its
 * `<select>` in a *plain* `<label>` — deliberately WITHOUT the `boolean`
 * class that the boolean branch adds. Per the file:
 *
 *     // enum branch
 *     <label key={key}>
 *       <span>{field.label}</span>
 *       <select ...>
 *         {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
 *       </select>
 *     </label>
 *
 *     // boolean branch
 *     <label key={key} className="boolean">
 *       <input type="checkbox" ... />
 *       <span>{field.label}</span>
 *     </label>
 *
 * The visible-label-then-select order on the enum row (the inverse of the
 * boolean order) is what makes the omitted class load-bearing — every
 * game's setup CSS uses the presence/absence of `.boolean` to lay number /
 * enum rows differently from checkbox rows. If a refactor accidentally
 * stamped `className="boolean"` on every row (or on the enum branch), the
 * only signal would be a broken setup layout in production.
 *
 * Why this is worth its own test:
 *   - W1142 (`PlayPage.setupSettingsBooleanRowClass`) pins the *presence*
 *     of `boolean` on the boolean row — but says nothing about the enum
 *     branch, so a copy-paste regression onto the enum branch would not
 *     trip it.
 *   - W1149 (`PlayPage.setupSettingsNumberRowClass`) pins the omitted class
 *     and label-first child order on the *number* branch only — never the
 *     enum branch. The two non-boolean branches share structure but live
 *     on independent code paths, so each needs its own pin.
 *   - W1043 (`PlayPage.settingsEnumField`) covers the in-game *modal* enum
 *     `<select>` (default value + options + change-flow), not the
 *     setup-screen `SettingsForm`, and never inspects the wrapping
 *     `<label>` (it locates the select via `data-testid` on the modal).
 *   - W1135 (`PlayPage.setupSettingsFormElement`) pins the outer
 *     `<form className="settings-form">` only — never any field row.
 *
 * Strategy:
 *   - Reuse the same minimal-fixture pattern as W1142 / W1149 with a single
 *     enum setting.
 *   - Anchor on `setup-panel` so the assertion is unambiguously scoped to
 *     the setup-screen `SettingsForm`.
 *   - Walk up from the `<select>` to its wrapping `<label>` and assert
 *     `tagName === "LABEL"`, that the label does NOT carry the `boolean`
 *     class, and that the row's first element child is the visible
 *     `<span>` label (not the select) — the structural inverse of the
 *     boolean branch which W1142 already pins.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-enum-row-class-fixture";
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
    title: "Setup Settings Enum Row Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for setup-screen SettingsForm enum row className.",
    settings: settingsSchema,
    initialState: (_seed: number, _settings: { difficulty: string }) => ({ moves: 0 }),
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

describe("SettingsForm enum field row wrapper className (W1155)", () => {
  it("wraps an enum setting's select in a plain <label> (no `boolean` class) on the setup screen", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor on the setup panel so the assertion is unambiguously scoped to
    // the setup-screen SettingsForm (not any other label elsewhere).
    const panel = screen.getByTestId("setup-panel");
    expect(panel).toBeTruthy();

    // Resolve the enum select via its accessible label, then walk up to its
    // wrapping <label>. SettingsForm's enum branch renders:
    //   <label key={key}>
    //     <span>{field.label}</span>
    //     <select ...>{field.options.map(...)}</select>
    //   </label>
    const select = screen.getByLabelText("Difficulty") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");

    const row = select.closest("label");
    expect(row).not.toBeNull();
    expect(row!.tagName).toBe("LABEL");

    // The enum branch deliberately omits the `boolean` class — this is the
    // structural inverse of W1142. If a refactor accidentally stamped
    // `className="boolean"` on every row, this assertion catches it.
    expect(row!.classList.contains("boolean")).toBe(false);

    // And it must live inside the setup panel's settings-form (not some
    // other label a refactor might add to the page chrome).
    expect(panel.contains(row)).toBe(true);
    expect(row!.closest("form.settings-form")).not.toBeNull();

    // Structural inverse of the boolean branch: enum rows render the
    // visible <span> label *before* the select. Pinning the child order
    // protects the omitted-class signal — together with the className
    // check this rules out a copy-paste regression that swaps the branches.
    const firstChild = row!.firstElementChild;
    expect(firstChild).not.toBeNull();
    expect(firstChild!.tagName).toBe("SPAN");
    expect(firstChild!.textContent).toBe("Difficulty");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
