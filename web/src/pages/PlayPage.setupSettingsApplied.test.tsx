/**
 * Unit test for PlayPage setup-screen settings flow (W727).
 *
 * What this guards: while `phase === "setup"` the setup panel renders the
 * plugin's `SettingsForm` (the SAME schema used by the in-game popover, but
 * mounted on the pre-start screen — no `play-setting-<key>` testids, just
 * plain `<label><span>…</span><input/></label>`). When the user toggles a
 * setting on that pre-start form and THEN clicks `start-game`, the new
 * value must be the one passed to `plugin.initialState(seed, settings)`,
 * not the schema default that was active at mount time.
 *
 * Why this is worth its own test:
 *   - Existing settings coverage is post-start: `PlayPage.settings.test.tsx`
 *     and `PlayPage.settingsPersist.test.tsx` both mount, click `start-game`
 *     immediately, and only then exercise the in-game popover. None of them
 *     mutate a setting on the SETUP screen before starting, so a regression
 *     that wires the setup form to a stale state slot (or skips writing the
 *     update before the `start` callback resolves `settings`) would slip
 *     past the existing suite.
 *   - The setup form is the only path that lets a player choose a
 *     configuration for the *first* call to `initialState` — every later
 *     call goes through the popover + restart flow. If that wiring breaks,
 *     the user's pre-start preferences are silently ignored on game one.
 *
 * Strategy:
 *   - `vi.hoisted` builds a fixture plugin with a single boolean setting
 *     (`deluxe`, default `false`) so we have a deterministic schema-default
 *     vs user-flipped value to compare against.
 *   - We spy on `fixturePlugin.initialState` so we can read back the
 *     `settings` object the page handed it when `start-game` was clicked.
 *   - The setup-screen `SettingsForm` doesn't render `data-testid`s — it
 *     uses `<label><span>{label}</span><input/></label>`, so we locate the
 *     checkbox by its accessible label text via `getByLabelText`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so the vi.mock factory below can reference it. vi.hoisted
// runs before the mocked module's imports are evaluated, so the closure is
// safe even though it visually looks like a TDZ violation.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "setup-settings-applied-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Setup Settings Applied Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for setup-screen settings flow tests.",
    settings: settingsSchema,
    initialState: (_seed: number, _settings: { deluxe: boolean }) => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin, settingsSchema };
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

describe("PlayPage setup-screen settings applied to initialState (W727)", () => {
  it("toggling a setting on the setup form before start-game flows into initialState", async () => {
    // Spy on the fixture plugin's initialState so we can read back the
    // settings object PlayPage handed it when start-game fired. Spying
    // (vs. wrapping) lets us also see the implicit mount-time call so we
    // can distinguish it from the user-driven start.
    const initSpy = vi.spyOn(hoisted.fixturePlugin, "initialState");

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor: the setup panel — and the un-styled SettingsForm inside it —
    // is mounted while phase === "setup". The toggle's accessible name
    // matches its schema label.
    expect(screen.getByTestId("setup-panel")).toBeTruthy();
    const deluxe = screen.getByLabelText("Deluxe") as HTMLInputElement;
    expect(deluxe.type).toBe("checkbox");
    // Sanity: the form initially reflects the schema default (false).
    expect(deluxe.checked).toBe(false);

    // Flip the setting BEFORE clicking start. The setup form's onChange
    // is wired straight to PlayPage's `setSettings`, so this should update
    // the live `settings` object the `start` callback closes over.
    fireEvent.click(deluxe);
    expect(deluxe.checked).toBe(true);

    // Capture the call count so we can isolate the start-driven invocation
    // from any earlier mount-time / effect-driven calls (e.g. the lazy
    // useState initializer).
    const callsBeforeStart = initSpy.mock.calls.length;

    fireEvent.click(screen.getByTestId("start-game"));

    // start() -> startWithSeed() must call plugin.initialState exactly
    // once more, and the `settings` argument must reflect the toggle.
    expect(initSpy.mock.calls.length).toBeGreaterThan(callsBeforeStart);
    const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
    // [seed, settings] — the second argument is the settings object.
    const passedSettings = lastCall[1] as { deluxe: boolean };
    expect(passedSettings.deluxe).toBe(true);
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;
