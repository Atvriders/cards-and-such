/**
 * Unit test for SettingsForm enum-row label-click focus a11y (W1174).
 *
 * Analog of W1161 (boolean label-click focus) and W1170 (number label-click
 * focus) for the enum branch.
 *
 * What this guards: in `SettingsForm`
 * (`web/src/platform/game-plugin/settings.tsx`) the enum branch renders the
 * visible label text inside a `<span>` that lives INSIDE the same
 * `<label>` element which also wraps the `<select>`:
 *
 *     // enum branch
 *     <label key={key}>
 *       <span>{field.label}</span>
 *       <select ...>
 *         {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
 *       </select>
 *     </label>
 *
 * Because the `<span>` is a descendant of the wrapping `<label>`, native
 * browser (and jsdom) behaviour treats a click on the visible label text
 * as a click on the wrapped form control — which focuses the select. If a
 * refactor ever replaces the wrapping `<label>` with two sibling elements
 * (e.g. `<label htmlFor>` paired with a separate select, or a plain
 * `<div>`+`<span>` wrapper), the implicit focus-on-label-click hit-target
 * association silently breaks for enum rows. Enum rows are especially
 * sensitive to this because — unlike checkboxes which give visual feedback
 * by toggling — losing focus on a select is invisible until the user tries
 * to use the keyboard (arrow keys / typeahead) and discovers the keystrokes
 * go nowhere.
 *
 * Why this is worth its own test:
 *   - W1161 (`PlayPage.setupSettingsLabelClickFocus`) covers the *boolean*
 *     branch only — its hoisted fixture has a single boolean setting and
 *     it asserts `document.activeElement === checkbox`. A regression that
 *     splits the enum branch's `<label>`+`<select>` into siblings while
 *     leaving the boolean branch alone would still pass W1161.
 *   - W1170 (`PlayPage.setupSettingsNumberLabelClickFocus`) covers the
 *     *number* branch only. The two non-boolean branches share structure
 *     but live on independent code paths, so each needs its own pin.
 *   - W1155 (`PlayPage.setupSettingsEnumRowClass`) only checks the wrapping
 *     `<label>` element's tagName, missing-`boolean`-class, and the
 *     firstChild-is-`<span>` order — it never dispatches a click on the
 *     `<span>` and never reads `document.activeElement`, so dropping the
 *     `<select>` out of the `<label>` (e.g. into a sibling) would still
 *     pass W1155 if the resulting wrapper kept its `<label>` tag.
 *   - W1043 (`PlayPage.settingsEnumField`) covers the in-game *modal* enum
 *     `<select>` (default value + options + change-flow), not the
 *     setup-screen `SettingsForm`, and never tests label-click focus
 *     routing.
 *   - W727 (`PlayPage.setupSettingsApplied`) drives the enum select via
 *     `getByLabelText` + `fireEvent.change`; testing-library would still
 *     resolve the select via `aria-labelledby` / `htmlFor` even if the
 *     wrapping relationship was lost, so it cannot detect this regression.
 *
 * Strategy:
 *   - Reuse the same minimal hoisted-fixture pattern as W1155 / W1161 /
 *     W1170 with a single enum setting so we have a deterministic,
 *     single-row setup form to query.
 *   - Resolve the select via `getByLabelText` (which proves the
 *     accessibility-name relationship works at all), then walk to its
 *     wrapping `<label>` and locate the visible-text `<span>` inside.
 *   - Dispatch a click on the `<span>` (NOT the select) and assert
 *     `document.activeElement === select`. In jsdom a click on a
 *     descendant of a wrapping `<label>` propagates to the labelled
 *     control and focuses it — exactly the behaviour the wrapping
 *     pattern exists to guarantee for enum rows.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-enum-label-click-focus-fixture";
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
    title: "Setup Settings Enum Label Click Focus Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for setup-screen SettingsForm enum-row label-click-focus a11y.",
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

describe("SettingsForm enum-row label-click focuses wrapped select (W1174)", () => {
  it("clicking the visible label <span> focuses the contained <select> on the setup screen", async () => {
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

    // Locate the select via its accessible label first; this also proves
    // the label-control association is live before we exercise the click
    // path.
    const select = screen.getByLabelText("Difficulty") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");

    // Walk to the wrapping <label> and find the visible-text <span>. The
    // enum branch renders <span>{field.label}</span> first then <select/>,
    // both as direct children of the same <label>.
    const row = select.closest("label");
    expect(row).not.toBeNull();
    const span = row!.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("Difficulty");

    // Pre-condition: the select specifically is not focused yet.
    expect(document.activeElement).not.toBe(select);

    // Click the visible label text — NOT the select. Because the <span>
    // is a descendant of the wrapping <label>, the click must route to
    // the labelled control and focus it. We use userEvent (rather than
    // raw fireEvent) because it simulates the full browser-side click
    // sequence including the implicit focus that real browsers apply
    // when a label receives a click — which is precisely the property
    // the wrapping `<label>` exists to provide.
    await user.click(span!);

    expect(document.activeElement).toBe(select);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
