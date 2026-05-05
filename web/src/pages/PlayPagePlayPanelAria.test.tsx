/**
 * Pinpoint test for the PlayPage game-stage `<section>` ARIA surface
 * (W1935).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2522) renders the active play surface inside
 *   a `<section ref={playPanelRef} className={`play-panel play-board…`}>`
 *   element. The section deliberately carries no `aria-label`, no
 *   `aria-labelledby`, and no explicit `role` attribute — it is a plain
 *   semantic `<section>`. The visual heading and labeling responsibilities
 *   live in the page header above; the play-panel itself is treated as
 *   a layout host for the active plugin's component, not as a labelled
 *   landmark in its own right.
 *
 *   Existing tests cover the className (W1880, PlayPageGameStageClass),
 *   the `play-panel--paused` modifier (W1126, W1131), the with-sidebar
 *   structural wrapper, and the fullscreen track wiring. None of them
 *   pin the section's ARIA attributes. That gap means an accidental
 *   addition of `aria-label="Play surface"` (or a role override that
 *   would change AT semantics) would silently land — landmark-region
 *   axe rules and SR rotor output both depend on whether a `<section>`
 *   has an accessible name.
 *
 *   This test fills the gap with the minimum surface: render → start →
 *   grab the `.play-panel` section and assert that
 *     • it has no `aria-label` attribute
 *     • it has no `aria-labelledby` attribute
 *     • it has no explicit `role` attribute
 *   so any future ARIA decoration of the play surface is a deliberate
 *   change reflected in this test rather than a quiet drift.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-page-play-panel-aria-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Play Page Play Panel Aria Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the PlayPage play-panel ARIA absence test.",
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

describe("PlayPage play-panel ARIA absence (W1935)", () => {
  it("renders the play surface section with no aria-label, aria-labelledby, or role", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup phase so the playing branch mounts the
    // `.play-panel` host section that wraps `<plugin.component>`.
    fireEvent.click(screen.getByTestId("start-game"));

    const panel = container.querySelector(
      "section.play-panel.play-board",
    ) as HTMLElement | null;
    expect(panel).not.toBeNull();

    // Pin the ARIA surface as "intentionally bare". `hasAttribute`
    // returns true for any string value (including ""), so this fails
    // loudly the moment the section grows an accessible name or an
    // explicit role override.
    expect(panel!.hasAttribute("aria-label")).toBe(false);
    expect(panel!.hasAttribute("aria-labelledby")).toBe(false);
    expect(panel!.hasAttribute("role")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
