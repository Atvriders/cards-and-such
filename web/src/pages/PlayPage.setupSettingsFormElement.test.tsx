/**
 * Unit test for PlayPage setup-screen settings-form element contract (W1135).
 *
 * What this guards: while `phase === "setup"` the setup panel mounts the
 * plugin's `SettingsForm`, which renders a literal `<form
 * className="settings-form">` element wrapping the schema-driven inputs.
 * The `<form>` tag (vs. a generic `<div>`) is what gives the setup
 * configuration a real submission boundary — `SettingsForm` attaches
 * `onSubmit={(e) => e.preventDefault()}` to suppress accidental page
 * navigation when the user presses Enter inside any setup field. The
 * `settings-form` class is the styling hook every game's CSS targets to
 * lay out the pre-start configuration.
 *
 * Why this is worth its own test:
 *   - W1091 (`PlayPage.setupContent`)  covers the how-to-play heading.
 *   - W1084 / W1085 cover the Start button label / UI contract.
 *   - W1104 (`PlayPage.setupPanelSection`) covers the panel's <section> tag.
 *   - W1120 (`PlayPage.setupPanelClass`) covers the panel's `setup-panel` class.
 *   - W727  (`PlayPage.setupSettingsApplied`) covers the *behaviour* of
 *     toggling a setting on the setup form and starting the game — but it
 *     never asserts the wrapper's element type or class, only that the
 *     accessible label resolves to a checkbox.
 *
 *   None of those tests would notice if `SettingsForm`'s wrapper became a
 *   `<div>` (silently dropping the implicit Enter-to-submit semantics and
 *   the `onSubmit` preventDefault) or if its className was renamed (silently
 *   detaching the page from its CSS).
 *
 * Strategy:
 *   - Reuse the same minimal-fixture pattern as the other setup tests.
 *   - Provide a one-field schema so the form has at least one input child;
 *     this keeps the test honest about "the form *wraps* the fields", not
 *     just "the form exists somewhere on the page".
 *   - Resolve the form via the setup-panel anchor + a `form.settings-form`
 *     querySelector, then assert tagName === "FORM" and the class.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-form-element-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Setup Settings Form Element Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for setup-screen settings-form element/class contract.",
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

describe("PlayPage setup-screen settings-form element contract (W1135)", () => {
  it("renders the SettingsForm wrapper as a <form> with the literal `settings-form` class inside the setup panel", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor: the setup panel is mounted while phase === "setup".
    const panel = screen.getByTestId("setup-panel");
    expect(panel).toBeTruthy();

    // Element + class contract: the SettingsForm wrapper is a real <form>
    // element with the `settings-form` class, scoped inside the setup panel.
    const form = panel.querySelector("form.settings-form");
    expect(form).not.toBeNull();
    expect(form!.tagName).toBe("FORM");
    expect(form!.classList.contains("settings-form")).toBe(true);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
