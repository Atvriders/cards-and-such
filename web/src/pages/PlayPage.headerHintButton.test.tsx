/**
 * Unit test for the PlayPage header hint button UI contract (W922).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2009) renders a `<button data-testid="play-hint-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   user has hints enabled (`cards-hints-enabled` localStorage flag, per
 *   W775). The button is `type="button"` (so a stray wrapping form can
 *   never submit), it carries an aria-label of "Hint" (announcing intent
 *   to screen readers — the button has a sighted-only "Hint" text label
 *   plus the lightbulb glyph, so the aria-label still drives a11y), and
 *   it shows a visible lightbulb SVG icon. Sibling tests cover the
 *   pulse lifecycle (W496 hint), cooldown gating (hintCooldown), and
 *   plugin-presence gating (hintGating), but no test pins the button's
 *   *visible UI attributes* — so a regression that swapped the
 *   aria-label for "Show hint" (drift), set `type="submit"` (form-bug),
 *   or replaced the inline lightbulb SVG with a text glyph would slip
 *   past every existing test.
 *
 *   Unlike the help-btn (W914), this button is gated on a plugin-level
 *   `hint()` function AND the user's hints-enabled setting, so we mock a
 *   fixture plugin with a no-op hint() and pre-seed `cards-hints-enabled`
 *   to "true" before mounting.
 *
 * Strategy mirrors PlayPage.headerHelpButton.test.tsx (W914),
 * PlayPage.headerInfoButton.test.tsx (W900), and
 * PlayPage.headerSettingsButton.test.tsx (W906):
 *   - Hoisted minimal fixture plugin with `hint()` defined so the
 *     iconbar branch (`phase === "playing" && hintsEnabled`) renders the
 *     button as enabled (`disabled={!plugin.hint || ...}` evaluates false).
 *   - Pre-seed `cards-hints-enabled = "true"` so the gate is open.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Pin four static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Hint" (screen-reader contract).
 *       4. an inline <svg> glyph child (visible icon contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `hint()` must be defined so the button is rendered as enabled (the
// `disabled={!plugin.hint || ...}` branch evaluates to false). Per the
// W775 finding, the button is also gated on `cards-hints-enabled` being
// "true" — we set that in beforeEach.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-btn-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header hint-button UI test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // Returning a selector that won't match anything is fine — this test
    // never clicks the button, it only inspects its rendered attributes.
    hint: () => ({ selector: "[data-testid='nonexistent']" }),
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
  // Hints are gated by a Settings → Gameplay toggle (`cards-hints-enabled`).
  // Make the on-state explicit so this test isn't subject to default
  // changes elsewhere (per W775 finding).
  localStorage.setItem("cards-hints-enabled", "true");
  // Disable the cooldown gate so the button isn't rendered in a "5s"
  // countdown state — keeps the aria-label assertion stable.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header hint button UI contract (W922)", () => {
  it("renders a <button type='button'> with the 'Hint' a11y label and visible SVG glyph", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Hint button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract — with the cooldown disabled the aria-label
    // is the static "Hint" string. (When the cooldown is active and
    // counting down it switches to "Hint, available in Ns" — a separate
    // sibling test pins that branch.)
    expect(btn.getAttribute("aria-label")).toBe("Hint");

    // Visible glyph contract — the only sighted-user signal that this
    // is the hint button (the lightbulb icon). Replacing the inline SVG
    // with a text glyph or removing it entirely would break visual
    // recognition while a11y stayed green.
    const svg = btn.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
