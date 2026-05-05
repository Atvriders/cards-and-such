/**
 * Pinpoint test for the PlayPage game-stage `<section>` `id` attribute
 * absence (W2013).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2524) renders the active play surface inside
 *   a `<section ref={playPanelRef} className={`play-panel play-board…`}>`
 *   element. The section deliberately carries no `id` attribute — it is
 *   located via `playPanelRef` and `.play-panel` className queries, never
 *   via DOM id. Adding an `id` would change CSS targeting surface,
 *   `document.getElementById` discoverability, and skip-link / hash-link
 *   semantics; the play surface is currently not intended to be such an
 *   anchor.
 *
 *   Existing tests cover:
 *     • className shape (W1880, PlayPageGameStageClass)
 *     • the `play-panel--paused` modifier (W1126, W1131)
 *     • ARIA absence — aria-label, aria-labelledby, role (W1935)
 *     • the with-sidebar structural wrapper
 *     • the fullscreen track wiring
 *
 *   None pin the `id` attribute. That gap means an accidental
 *   `id="play-panel"` (or a stylesheet-driven `id` graft) could land
 *   silently. This test fills the gap with the minimum surface: render →
 *   start → grab the `.play-panel` section and assert that
 *     • `panel.hasAttribute("id") === false`
 *   so any future identifier on the play surface is a deliberate change
 *   reflected here rather than a quiet drift.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-page-play-panel-no-id-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Play Page Play Panel No Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the PlayPage play-panel id-attribute absence test.",
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

describe("PlayPage play-panel id-attribute absence (W2013)", () => {
  it("renders the play surface section with no id attribute", async () => {
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

    // Pin "no id". `hasAttribute("id")` returns true for any string value
    // (including ""), so this fails loudly the moment the section grows
    // any kind of DOM id.
    expect(panel!.hasAttribute("id")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
