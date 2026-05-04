/**
 * Unit test for SettingsForm number-row label-click focus a11y (W1170).
 *
 * Analog of W1161 (boolean label-click focus) for the number branch.
 *
 * What this guards: in `SettingsForm`
 * (`web/src/platform/game-plugin/settings.tsx`) the number branch renders
 * the visible label text inside a `<span>` that lives INSIDE the same
 * `<label>` element which also wraps the `<input type="number">`:
 *
 *     // number branch
 *     <label key={key}>
 *       <span>{field.label}</span>
 *       <input type="number" ... />
 *     </label>
 *
 * Because the `<span>` is a descendant of the wrapping `<label>`, native
 * browser (and jsdom) behaviour treats a click on the visible label text
 * as a click on the wrapped form control — which focuses the input. If a
 * refactor ever replaces the wrapping `<label>` with two sibling elements
 * (e.g. `<label htmlFor>` paired with a separate input, or a plain
 * `<div>`+`<span>` wrapper), the implicit focus-on-label-click hit-target
 * association silently breaks for number rows. Number rows are especially
 * sensitive to this because — unlike checkboxes which give visual feedback
 * by toggling — losing focus on a number input is invisible until the user
 * tries to type and discovers the keystrokes go nowhere.
 *
 * Why this is worth its own test:
 *   - W1161 (`PlayPage.setupSettingsLabelClickFocus`) covers the *boolean*
 *     branch only — its hoisted fixture has a single boolean setting and
 *     it asserts `document.activeElement === checkbox`. A regression that
 *     splits the number branch's `<label>`+`<input>` into siblings while
 *     leaving the boolean branch alone would still pass W1161.
 *   - W1149 (`PlayPage.setupSettingsNumberRowClass`) only checks the
 *     wrapping `<label>` element's tagName, missing-`boolean`-class, and
 *     the firstChild-is-`<span>` order — it never dispatches a click on
 *     the `<span>` and never reads `document.activeElement`, so dropping
 *     the `<input>` out of the `<label>` (e.g. into a sibling) would still
 *     pass W1149 if the resulting wrapper kept its `<label>` tag.
 *   - W1056 (`PlayPage.settingsNumberField`) covers the in-game *modal*
 *     number input change-flow (min/max/step), not the setup-screen
 *     `SettingsForm`, and never tests label-click focus routing.
 *   - W727 (`PlayPage.setupSettingsApplied`) drives the number input via
 *     `getByLabelText` + `fireEvent.change`; testing-library would still
 *     resolve the input via `aria-labelledby` / `htmlFor` even if the
 *     wrapping relationship was lost, so it cannot detect this regression.
 *
 * Strategy:
 *   - Reuse the same minimal hoisted-fixture pattern as W1149 / W1161 with
 *     a single number setting so we have a deterministic, single-row setup
 *     form to query.
 *   - Resolve the input via `getByLabelText` (which proves the
 *     accessibility-name relationship works at all), then walk to its
 *     wrapping `<label>` and locate the visible-text `<span>` inside.
 *   - Dispatch a click on the `<span>` (NOT the input) and assert
 *     `document.activeElement === input`. In jsdom a click on a
 *     descendant of a wrapping `<label>` propagates to the labelled
 *     control and focuses it — exactly the behaviour the wrapping
 *     pattern exists to guarantee for number rows.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-number-label-click-focus-fixture";
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
    title: "Setup Settings Number Label Click Focus Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for setup-screen SettingsForm number-row label-click-focus a11y.",
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

describe("SettingsForm number-row label-click focuses wrapped input (W1170)", () => {
  it("clicking the visible label <span> focuses the contained number input on the setup screen", async () => {
    const user = userEvent.setup();
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor on the setup panel so the assertion is unambiguously scoped to
    // the setup-screen SettingsForm.
    const panel = screen.getByTestId("setup-panel");
    expect(panel).toBeTruthy();

    // Locate the input via its accessible label first; this also proves
    // the label-control association is live before we exercise the click
    // path.
    const input = screen.getByLabelText("Rounds") as HTMLInputElement;
    expect(input.type).toBe("number");

    // Walk to the wrapping <label> and find the visible-text <span>. The
    // number branch renders <span>{field.label}</span> first then <input/>,
    // both as direct children of the same <label>.
    const row = input.closest("label");
    expect(row).not.toBeNull();
    const span = row!.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("Rounds");

    // Pre-condition: the number input specifically is not focused yet.
    expect(document.activeElement).not.toBe(input);

    // Click the visible label text — NOT the input. Because the <span>
    // is a descendant of the wrapping <label>, the click must route to
    // the labelled control and focus it. We use userEvent (rather than
    // raw fireEvent) because it simulates the full browser-side click
    // sequence including the implicit focus that real browsers apply
    // when a label receives a click — which is precisely the property
    // the wrapping `<label>` exists to provide.
    await user.click(span!);

    expect(document.activeElement).toBe(input);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
