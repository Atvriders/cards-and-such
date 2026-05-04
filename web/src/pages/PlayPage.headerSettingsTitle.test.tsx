/**
 * Unit test for the PlayPage header settings button native `title=`
 * attribute (W1178 — follow-up to W1172's note that pause/settings/info
 * remain untested for the native title channel).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2149) renders the settings button with three
 *   overlapping label channels — `aria-label="Game settings"` (screen-reader
 *   announcement), `data-tooltip="Settings"` (CSS hover-tooltip layer
 *   surfaces the shorter visual label), and `title="Game settings"` (native
 *   browser tooltip surfaced on long-hover for desktop pointer users that
 *   lack the CSS tooltip styling, and exposed to AT as a fallback name
 *   source).
 *
 *   Sibling tests on this button cover other facets:
 *     - W906 (headerSettingsButton) pins tagName/type/aria-label/aria-haspopup
 *       and the SVG glyph
 *     - W961 (headerSettingsTooltip) pins `data-tooltip="Settings"`
 *     - headerSettingsKeyshortcuts pins aria-keyshortcuts
 *     - headerSettingsAriaExpanded / headerSettingsAriaControls pin the
 *       dialog wiring
 *   None asserts on the native `title=` attribute. A regression that
 *   dropped the title (no native browser hover-text on desktops without
 *   the CSS tooltip), shortened it to "Settings" (sync'd with data-tooltip),
 *   or swapped to verbose "Open game settings" copy would slip past every
 *   existing test on this button.
 *
 * Strategy mirrors PlayPage.headerFullscreenTitle.test.tsx (W1172) — pin
 * the literal "Game settings" value via getAttribute("title") on the
 * settings button, which mounts in the playing phase only when the plugin
 * defines at least one setting (so the fixture supplies one).
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
  const TEST_GAME_ID = "header-settings-title-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Settings Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header settings native title test.",
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

describe("PlayPage header settings button native title contract (W1178)", () => {
  it("pins title='Game settings' so the native browser tooltip surfaces the verbose label on long-hover (and serves as an AT fallback name)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Settings button only mounts in the playing phase (and only when the
    // plugin has at least one setting), so advance past the setup screen
    // first. The fixture above supplies the required `deluxe` setting.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-settings-btn") as HTMLButtonElement;

    // Native title contract — distinct channel from data-tooltip ("Settings").
    // The verbose "Game settings" string matches the aria-label so AT that
    // falls back to the title attribute receives the same name. A regression
    // that dropped the title, sync'd it with data-tooltip ("Settings"), or
    // swapped to "Open game settings"/"Toggle settings" copy would slip
    // past every other test on this button.
    expect(btn.getAttribute("title")).toBe("Game settings");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
