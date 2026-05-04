/**
 * Unit test for the PlayPage overflow ("more actions") button
 * `aria-haspopup="menu"` attribute (W1312).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2061) renders a mobile-only ••• overflow button
 *   (`data-testid="play-overflow-btn"`) that reveals the secondary
 *   toolbar group (which itself has `role="menu"`) on sub-600px
 *   viewports. The button declares `aria-haspopup="menu"` so screen
 *   readers announce that activation will surface a menu — the value
 *   must match the `role="menu"` on the popped-up wrapper for an AT
 *   user to receive a coherent disclosure announcement. A regression
 *   that changed this to `dialog`/`true`/dropped it entirely would
 *   silently break the assistive-tech contract while leaving the visual
 *   behavior intact (and so passing every other overflow test).
 *
 *   Sibling tests cover:
 *     - W1016 overflowBtnToggle: click toggles aria-expanded /
 *       data-overflow-open.
 *     - overflowClose / overflowOutsideClick: Esc + outside-click close.
 *     - overflowMenuContent: secondary group children render.
 *     - toolbarSecondaryRole: pins `role="menu"` on the popover.
 *
 *   None of those read aria-haspopup off the toggle, so this attribute
 *   is currently unpinned.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "overflow-haspopup-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Overflow Haspopup Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the overflow aria-haspopup test.",
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

describe("PlayPage overflow aria-haspopup (W1312)", () => {
  it("declares aria-haspopup=\"menu\" on the ••• overflow toggle", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The overflow button only mounts in the playing phase.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-overflow-btn");

    // Pin the literal value — must be "menu" so it pairs with the
    // role="menu" wrapper that the toggle reveals. Asserting the exact
    // string (not just presence) catches regressions to "true",
    // "dialog", "listbox", or removal.
    expect(btn.getAttribute("aria-haspopup")).toBe("menu");
  });
});

void React;
