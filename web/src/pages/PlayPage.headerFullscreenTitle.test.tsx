/**
 * Unit test for the PlayPage header fullscreen button native `title=`
 * attribute (W1172).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2191) renders the fullscreen button with three
 *   overlapping label channels — `aria-label="Fullscreen"` (screen-reader
 *   announcement), `data-tooltip="Fullscreen"` (CSS hover-tooltip layer),
 *   and `title="Fullscreen"` (native browser tooltip surfaced on long-hover
 *   for desktop pointer users that lack the CSS tooltip styling, and
 *   exposed to AT as a fallback name source).
 *
 *   Sibling tests on this button pin tooltip/keyshortcuts/aria but none
 *   asserts on the native `title=` attribute. A regression that dropped
 *   the title (no native browser hover-text), drifted to "Full screen"
 *   (spacing change), or swapped to verbose "Toggle fullscreen" copy
 *   would slip past every existing test on this button.
 *
 * Strategy mirrors PlayPage.headerRestartTitle.test.tsx (W1166) — pin the
 * literal "Fullscreen" value via getAttribute("title") on the fullscreen
 * button, which mounts unconditionally in the playing phase.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted Counter fixture — vi.hoisted runs before vi.mock factories evaluate.
// The fullscreen button mounts unconditionally in the playing phase (no
// settings/howToPlay gating), so a minimal counter plugin suffices.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-fullscreen-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Fullscreen Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header fullscreen-button title pin.",
    settings: {} as Record<string, never>,
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

describe("PlayPage header fullscreen button title contract (W1172)", () => {
  it("pins title='Fullscreen' so the native browser hover-tooltip surfaces the correct copy", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Fullscreen button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-fullscreen-btn") as HTMLButtonElement;

    // Native browser-tooltip contract — pin the literal "Fullscreen" copy.
    // Drift to "Full screen" (spacing), "Toggle fullscreen" (verbose copy),
    // or an empty/missing attribute (no native tooltip at all) would slip
    // past sibling tooltip/keyshortcuts/aria tests on this button.
    expect(btn.getAttribute("title")).toBe("Fullscreen");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
