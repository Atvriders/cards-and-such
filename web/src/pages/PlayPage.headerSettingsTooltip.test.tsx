/**
 * Unit test for the PlayPage header settings button data-tooltip attribute
 * contract (W961 — analog of W935 (redo), W947 (undo), W953/W954/W960 which
 * pinned `data-tooltip` on the other toolbar buttons but left the settings
 * button's sibling attribute unpinned).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2153) renders a `<button data-testid="play-settings-btn">`
 *   in the header iconbar whenever `phase === "playing"` AND the active
 *   plugin defines at least one settings entry. The button carries a
 *   `data-tooltip="Settings"` attribute that the toolbar's CSS
 *   hover-tooltip layer reads to render the floating label on pointer
 *   hover (the native `title="Game settings"` is suppressed on touch
 *   devices and on focus-only flows where the OS tooltip would never
 *   appear).
 *
 *   Sibling tests cover other facets of the same button:
 *     - W906 (headerSettingsButton) pins tagName/type/aria-label/aria-haspopup
 *       and the SVG glyph
 *     - headerSettingsKeyshortcuts pins aria-keyshortcuts
 *     - W730 (Esc-close) and W756 (T-hotkey toggle) cover open/close flows
 *   None assert anything about `data-tooltip`.
 *
 *   Note that the data-tooltip text ("Settings") differs from the
 *   aria-label ("Game settings") — the hover-tooltip layer favors a
 *   shorter visual label while the screen-reader label is more verbose.
 *   A regression that synced them (e.g. setting data-tooltip="Game settings"),
 *   dropped the attribute entirely, or copy-pasted another button's tooltip
 *   ("Undo"/"Redo"/etc.) would slip past every existing test.
 *
 * Strategy mirrors W935/W947 — single focused attribute pin:
 *   - Hoisted minimal fixture plugin with one boolean setting so the
 *     iconbar branch (`Object.keys(plugin.settings).length > 0`)
 *     renders the button.
 *   - Mount at `/play/:gameId`, advance past setup → playing phase.
 *   - Locate the settings button via its testid and pin `data-tooltip`
 *     exactly.
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
  const TEST_GAME_ID = "header-settings-tooltip-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Settings Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header settings data-tooltip test.",
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

describe("PlayPage header settings button data-tooltip contract (W961)", () => {
  it("pins data-tooltip='Settings' so the CSS hover-tooltip layer surfaces the correct label on pointer hover", async () => {
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

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders a
    // floating label by reading `data-tooltip`. The shorter "Settings"
    // string is intentionally distinct from the verbose aria-label
    // ("Game settings"). A regression that synced them, dropped the
    // attribute, or copy-pasted "Undo"/"Redo"/"Restart" would all be
    // invisible to every other test on this button.
    expect(btn.getAttribute("data-tooltip")).toBe("Settings");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
