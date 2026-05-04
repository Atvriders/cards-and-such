/**
 * Unit test for the PlayPage header restart button native `title=` attribute
 * (W1166).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2045) renders the restart button with three
 *   overlapping label channels — `aria-label="Restart"` (screen-reader
 *   announcement), `data-tooltip="Restart"` (CSS hover-tooltip layer),
 *   and `title="Restart"` (native browser tooltip surfaced on long-hover
 *   for desktop pointer users that lack the CSS tooltip styling, and
 *   exposed to AT as a fallback name source).
 *
 *   The W925 sibling (PlayPage.headerRestartButton.test.tsx) pins
 *   tagName/type/aria-label/glyph. The W929 sibling
 *   (PlayPage.headerRestartTooltip.test.tsx) pins `data-tooltip`. Neither
 *   asserts on the native `title=` attribute. A regression that dropped
 *   the title (no native browser hover-text), drifted to "Reset" (verb
 *   change while a11y stayed green), or swapped to a verbose "Restart
 *   game" copy would slip past every existing test on this button.
 *
 * Strategy mirrors PlayPage.headerHintTitle.test.tsx (W1157) — the only
 * other test that pins a button's native `title=` attribute under a
 * dedicated fixture — but targets the play-restart-btn instead of
 * play-hint-btn. We hoist a minimal Counter-style fixture plugin (the
 * restart button mounts unconditionally in the playing phase, no extra
 * gating), advance past the setup screen, and assert the literal "Restart"
 * value via getAttribute("title").
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted Counter fixture — vi.hoisted runs before vi.mock factories evaluate.
// The restart button mounts unconditionally in the playing phase (no
// settings/howToPlay gating), so a minimal counter plugin suffices.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-restart-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Restart Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the header restart-button title pin.",
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

describe("PlayPage header restart button title contract (W1166)", () => {
  it("pins title='Restart' so the native browser hover-tooltip surfaces the correct verb", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Restart button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-restart-btn") as HTMLButtonElement;

    // Native browser-tooltip contract — pin the literal "Restart" copy.
    // Drift to "Reset" (verb change), "Restart game" (verbose copy), or
    // an empty/missing attribute (no native tooltip at all) would slip
    // past W925 (which only asserts aria-label/type/glyph) and W929
    // (which only asserts data-tooltip).
    expect(btn.getAttribute("title")).toBe("Restart");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
