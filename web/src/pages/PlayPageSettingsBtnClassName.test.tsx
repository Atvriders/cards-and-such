/**
 * Unit test for the PlayPage in-game settings cog className contract (W1290).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2147) renders the in-game settings cog button with
 *   the className pair `play-iconbtn play-settings-btn` (steady, non-dirty
 *   state). The `play-iconbtn` token hooks the button into the shared
 *   header iconbar styling (size, hover ring, focus outline, and the CSS
 *   hover-tooltip surface that consumes the `data-tooltip` attribute pinned
 *   by W910). The `play-settings-btn` token is the per-button hook used to
 *   scope settings-specific styling (cog glyph color, the dirty-dot
 *   anchoring, the `--dirty` modifier toggle).
 *
 *   Sibling tests pin the button's tag/type/aria-label/aria-haspopup/SVG
 *   presence (W906), aria-expanded (open/closed), aria-controls, title,
 *   tooltip, keyshortcuts, and the dirty-banner copy — but no test asserts
 *   the className token pair. A regression that stripped `play-iconbtn`
 *   (breaking the hover ring + tooltip surface) or renamed
 *   `play-settings-btn` (breaking the per-button hook + the
 *   `play-settings-btn--dirty` modifier base) would slip past every
 *   existing test.
 *
 * Strategy mirrors PlayPageHintBtnClassName.test.tsx (W1254) and
 * PlayPage.headerSettingsButton.test.tsx (W906):
 *   - Hoisted fixture plugin with one boolean setting so the iconbar
 *     branch (`Object.keys(plugin.settings).length > 0`) renders the
 *     settings button when `phase === "playing"`.
 *   - Mount at `/play/:gameId`, click `start-game` to advance to playing.
 *   - Locate the button by testid.
 *   - Assert classList contains both `play-iconbtn` and `play-settings-btn`.
 *     The `--dirty` modifier is gated on `settingsDirty`, which is false
 *     by default — so the steady-state classList is exactly the two
 *     base tokens.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-btn-classname-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Btn ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the in-game settings-cog className test.",
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

describe("PlayPage in-game settings cog className contract (W1290)", () => {
  it("renders the settings button with both 'play-iconbtn' and 'play-settings-btn' classes so the shared iconbar chrome and per-button hook stay wired", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Settings cog only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-settings-btn");

    // Shared iconbar hook — drives size, hover ring, focus outline, and
    // the CSS hover-tooltip surface that the `data-tooltip` attribute
    // (W910) feeds.
    expect(btn.classList.contains("play-iconbtn")).toBe(true);

    // Per-button hook — scopes cog-specific styling (glyph color,
    // dirty-dot anchoring) and serves as the base for the
    // `play-settings-btn--dirty` modifier toggled by `settingsDirty`.
    expect(btn.classList.contains("play-settings-btn")).toBe(true);
  });
});

void React;
