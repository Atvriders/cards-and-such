/**
 * Unit test for SettingsForm number-field row wrapper className (W1149).
 *
 * Analog of W1142 (boolean row class) for the number branch.
 *
 * What this guards: inside `SettingsForm`
 * (`web/src/platform/game-plugin/settings.tsx`) the number branch wraps
 * its `<input type="number">` in a *plain* `<label>` — deliberately WITHOUT
 * the `boolean` class that the boolean branch adds. Per the file:
 *
 *     // number branch
 *     <label key={key}>
 *       <span>{field.label}</span>
 *       <input type="number" ... />
 *     </label>
 *
 *     // boolean branch
 *     <label key={key} className="boolean">
 *       <input type="checkbox" ... />
 *       <span>{field.label}</span>
 *     </label>
 *
 * The visible-label-then-input order on the number row (the inverse of the
 * boolean order) is what makes the omitted class load-bearing — every
 * game's setup CSS uses the presence/absence of `.boolean` to lay number /
 * enum rows differently from checkbox rows. If a refactor accidentally
 * stamped `className="boolean"` on every row (or on the number branch),
 * the only signal would be a broken setup layout in production.
 *
 * Why this is worth its own test:
 *   - W1142 (`PlayPage.setupSettingsBooleanRowClass`) pins the *presence*
 *     of `boolean` on the boolean row — but says nothing about the number
 *     branch, so a copy-paste regression onto the number branch would not
 *     trip it.
 *   - W1056 (`PlayPage.settingsNumberField`) covers the in-game *modal*
 *     number input (min/max/step + change-flow), not the setup-screen
 *     `SettingsForm`, and never inspects the wrapping `<label>`.
 *   - W1135 (`PlayPage.setupSettingsFormElement`) pins the outer
 *     `<form className="settings-form">` only — never any field row.
 *
 * Strategy:
 *   - Reuse the same minimal-fixture pattern as W1142 / W1056 with a single
 *     number setting.
 *   - Anchor on `setup-panel` so the assertion is unambiguously scoped to
 *     the setup-screen `SettingsForm`.
 *   - Walk up from the number input to its wrapping `<label>` and assert
 *     `tagName === "LABEL"`, that the label does NOT carry the `boolean`
 *     class, and that the row's first element child is the visible
 *     `<span>` label (not the input) — the structural inverse of the
 *     boolean branch which W1142 already pins.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-number-row-class-fixture";
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
    title: "Setup Settings Number Row Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for setup-screen SettingsForm number row className.",
    settings: settingsSchema,
    initialState: (_seed: number, _settings: { rounds: number }) => ({ moves: 0 }),
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

describe("SettingsForm number field row wrapper className (W1149)", () => {
  it("wraps a number setting's input in a plain <label> (no `boolean` class) on the setup screen", async () => {
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

    // Resolve the number input via its accessible label, then walk up to
    // its wrapping <label>. SettingsForm's number branch renders:
    //   <label key={key}>
    //     <span>{field.label}</span>
    //     <input type="number" ... />
    //   </label>
    const input = screen.getByLabelText("Rounds") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("number");

    const row = input.closest("label");
    expect(row).not.toBeNull();
    expect(row!.tagName).toBe("LABEL");

    // The number branch deliberately omits the `boolean` class — this is
    // the structural inverse of W1142. If a refactor accidentally stamped
    // `className="boolean"` on every row, this assertion catches it.
    expect(row!.classList.contains("boolean")).toBe(false);

    // And it must live inside the setup panel's settings-form (not some
    // other label a refactor might add to the page chrome).
    expect(panel.contains(row)).toBe(true);
    expect(row!.closest("form.settings-form")).not.toBeNull();

    // Structural inverse of the boolean branch: number rows render the
    // visible <span> label *before* the input. Pinning the child order
    // protects the omitted-class signal — together with the className
    // check this rules out a copy-paste regression that swaps the branches.
    const firstChild = row!.firstElementChild;
    expect(firstChild).not.toBeNull();
    expect(firstChild!.tagName).toBe("SPAN");
    expect(firstChild!.textContent).toBe("Rounds");
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
