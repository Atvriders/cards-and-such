/**
 * Unit test for the PlayPage header settings button UI contract (W906).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2145) renders a `<button data-testid="play-settings-btn">`
 *   in the header iconbar whenever `phase === "playing"` and the active
 *   plugin defines at least one settings entry. It is a `type="button"`
 *   (so a stray wrapping form can never submit), it carries an aria-label
 *   of "Game settings" + `aria-haspopup="dialog"` (announcing the popover
 *   contract to screen readers), and it shows a visible cog SVG glyph.
 *   Sibling tests cover the Esc-close path (W730), the T-hotkey toggle
 *   (W756), and the dirty-dot indicator, but no test pins the button's
 *   *visible UI attributes* — so a regression that swapped the aria-label
 *   for "Settings" (drift), set `type="submit"` (form-bug), or replaced
 *   the cog SVG with a text glyph would slip past every existing test.
 *
 *   Unlike the info-btn (which is in the title row and renders in every
 *   phase), this button only mounts when (a) the game is past setup and
 *   (b) the plugin actually has tunable settings, so we mock a fixture
 *   plugin with one boolean setting and click `start-game` to advance.
 *
 * Strategy mirrors PlayPage.headerInfoButton.test.tsx (W900) and
 * PlayPage.hotkeyT.test.tsx (W756):
 *   - Hoisted minimal fixture plugin with one boolean setting so the
 *     iconbar branch resolves cleanly.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Pin five static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Game settings" (screen-reader contract).
 *       4. aria-haspopup === "dialog" (announces popover semantics).
 *       5. an inline <svg> glyph child (visible icon contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The settings schema must be non-empty so the iconbar branch
// (`Object.keys(plugin.settings).length > 0`) renders the button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-settings-btn-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Settings Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header settings-button UI test.",
    settings: settingsSchema,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
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

describe("PlayPage header settings button UI contract (W906)", () => {
  it("renders a <button type='button'> with the 'Game settings' a11y label, dialog popup hint, and visible cog SVG glyph", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Settings button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-settings-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract — the button has no visible text label
    // (just the cog SVG), so the aria-label *is* the only label.
    expect(btn.getAttribute("aria-label")).toBe("Game settings");

    // Popover semantics — announces to AT that activation opens a
    // dialog (the play-settings-modal). A regression that dropped this
    // would silently degrade screen-reader UX.
    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");

    // Visible glyph contract — the only sighted-user signal that this
    // is the settings button. Replacing the inline cog SVG with a text
    // glyph or removing it entirely would break visual recognition
    // while a11y stayed green.
    const svg = btn.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
