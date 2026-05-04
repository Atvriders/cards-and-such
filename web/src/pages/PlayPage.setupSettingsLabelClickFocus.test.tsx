/**
 * Unit test for SettingsForm label-wraps-control accessibility (W1161).
 *
 * What this guards: in `SettingsForm`
 * (`web/src/platform/game-plugin/settings.tsx`) every field's visible label
 * text is rendered inside a `<span>` that lives INSIDE the `<label>` element
 * which also wraps the form control:
 *
 *   <label className="boolean">
 *     <input type="checkbox" ... />
 *     <span>{field.label}</span>
 *   </label>
 *
 * Because the `<span>` is a descendant of the `<label>`, native browser
 * (and jsdom) behaviour treats a click on the visible label text as a
 * click on the wrapped form control — which both toggles AND focuses the
 * control. If a refactor ever replaces the wrapping `<label>` with two
 * sibling elements (e.g. `<label htmlFor>` paired with a separate input,
 * or worse, a plain `<div>`+`<span>` wrapper), the implicit focus + hit
 * target association silently breaks, hurting both pointer hit-target
 * size and screen-reader / keyboard navigation. No existing test asserts
 * this focus-on-label-click behaviour.
 *
 * Why this is worth its own test:
 *   - W1142 (`PlayPage.setupSettingsBooleanRowClass`) only checks the row
 *     wrapper's `tagName === "LABEL"` and `.boolean` className — it never
 *     dispatches a click event on the `<span>` and never reads
 *     `document.activeElement`, so dropping the `<input>` out of the
 *     `<label>` (e.g. into a sibling) would still pass that assertion.
 *   - W727 (`PlayPage.setupSettingsApplied`) flips the boolean by calling
 *     `fireEvent.click` on the input directly via `getByLabelText`; it
 *     never tests that clicking the visible label text routes the click
 *     to the input. Testing-library's `getByLabelText` would still
 *     resolve via `aria-labelledby` / `htmlFor` even if the wrapping
 *     relationship was lost.
 *   - W1135 (`PlayPage.setupSettingsFormElement`) only pins the outer
 *     `<form className="settings-form">` element — nothing about
 *     individual field structure.
 *
 * Strategy:
 *   - Reuse the same minimal hoisted-fixture pattern as W727 / W1142 with
 *     a single boolean setting so we have a deterministic, single-row
 *     setup form to query.
 *   - Resolve the input via `getByLabelText` (which proves the
 *     accessibility-name relationship works at all), then walk to its
 *     wrapping `<label>` and locate the visible-text `<span>` inside.
 *   - Dispatch a click on the `<span>` (NOT the input) and assert
 *     `document.activeElement === input`. In jsdom a click on a
 *     descendant of a wrapping `<label>` propagates to the labelled
 *     control and focuses it — exactly the behaviour the wrapping
 *     pattern exists to guarantee.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-label-click-focus-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Setup Settings Label Click Focus Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for setup-screen SettingsForm label-click-focus a11y.",
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

describe("SettingsForm label-click focuses wrapped control (W1161)", () => {
  it("clicking the visible label <span> focuses the contained input on the setup screen", async () => {
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
    const checkbox = screen.getByLabelText("Deluxe") as HTMLInputElement;
    expect(checkbox.type).toBe("checkbox");

    // Walk to the wrapping <label> and find the visible-text <span>. The
    // boolean branch renders <input/> first then <span>{field.label}</span>,
    // both as direct children of the same <label>.
    const row = checkbox.closest("label");
    expect(row).not.toBeNull();
    const span = row!.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("Deluxe");

    // Pre-condition: nothing in the form is focused yet (or at minimum,
    // the checkbox specifically is not focused).
    expect(document.activeElement).not.toBe(checkbox);

    // Click the visible label text — NOT the input. Because the <span>
    // is a descendant of the wrapping <label>, the click must route to
    // the labelled control and focus it. We use userEvent (rather than
    // raw fireEvent) because it simulates the full browser-side click
    // sequence including the implicit focus that real browsers apply
    // when a label receives a click — which is precisely the property
    // the wrapping `<label>` exists to provide.
    await user.click(span!);

    expect(document.activeElement).toBe(checkbox);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
