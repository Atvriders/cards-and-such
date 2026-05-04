/**
 * Unit test for the PlayPage header settings button aria-expanded toggle (W981).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2145) renders a `<button data-testid="play-settings-btn">`
 *   that opens/closes the settings popover. The button declares
 *   `aria-haspopup="dialog"` (static, pinned by W906) AND a *dynamic*
 *   `aria-expanded={settingsModalOpen}` that flips between "false"
 *   (popover closed) and "true" (popover open). The dynamic value is the
 *   screen-reader's only signal that activating the button changed
 *   disclosure state — a regression that hard-coded `aria-expanded={false}`,
 *   dropped the attribute, or wired it to the wrong state variable would
 *   silently break disclosure semantics for AT users while sighted users
 *   still saw the popover open and close.
 *
 *   Sibling tests cover:
 *     - W906 headerSettingsButton: static UI contract (tag, type, aria-label,
 *       aria-haspopup, glyph) — does NOT exercise aria-expanded.
 *     - W970 headerSettingsKeyshortcuts: absence of aria-keyshortcuts.
 *     - W756 hotkeyT: window-level toggle path (functional, not ARIA).
 *
 *   None of them assert that aria-expanded *toggles* with the popover
 *   state, leaving the disclosure-semantics contract unpinned. This is the
 *   settings-button analog of W975 (info-button aria-expanded).
 *
 * Strategy mirrors PlayPage.headerInfoAriaExpanded.test.tsx (W975):
 *   - Hoisted minimal fixture plugin with one boolean setting so the
 *     iconbar branch (`Object.keys(plugin.settings).length > 0`) renders
 *     the button.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase
 *     (the settings button only mounts in the playing phase).
 *   - Read aria-expanded BEFORE click — must be "false".
 *   - Click `play-settings-btn`.
 *   - Read aria-expanded AFTER click — must be "true". Also assert the
 *     popover actually mounted, so a future bug that toggled the ARIA
 *     attribute without rendering the dialog would still fail loudly.
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
  const TEST_GAME_ID = "header-settings-aria-expanded-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Settings Aria-Expanded Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the settings-button aria-expanded test.",
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

describe("PlayPage header settings button aria-expanded toggle (W981)", () => {
  it("flips aria-expanded from 'false' to 'true' when the settings popover opens", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Settings button only mounts in the playing phase, so advance past
    // the setup screen first — this also matches how a real user would
    // encounter the disclosure semantics mid-session.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-settings-btn");

    // Before click: popover is closed, screen readers must hear
    // "collapsed" via aria-expanded="false". A regression that dropped
    // the attribute (getAttribute -> null) or hard-coded "true" would
    // fail this assertion.
    expect(btn.getAttribute("aria-expanded")).toBe("false");

    // Open the popover.
    fireEvent.click(btn);

    // After click: popover is open, aria-expanded MUST flip to "true".
    // We re-read from the same element reference; React updates the live
    // attribute in place when the bound state changes.
    expect(btn.getAttribute("aria-expanded")).toBe("true");

    // Belt-and-braces: confirm the popover actually mounted, so a future
    // regression that *only* flipped the ARIA value without rendering
    // the dialog would still surface here rather than silently passing.
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
