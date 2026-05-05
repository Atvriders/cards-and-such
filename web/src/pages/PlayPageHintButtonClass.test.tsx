/**
 * Unit test for the PlayPage header hint button className exact equality (W1847).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2012) renders the header hint button with
 *     `className="play-iconbtn play-hint-btn"`
 *   exactly — two classes, single space, no modifier states. The
 *   `play-iconbtn` class hooks the button into the shared header iconbar
 *   styling (size, hover ring, focus outline, the CSS hover-tooltip
 *   surface). The `play-hint-btn` class is the per-button hook scoping
 *   hint-specific styling (lightbulb glyph color, label sizing).
 *
 *   Sibling test PlayPageHintBtnClassName.test.tsx (W1254) only asserts
 *   that *both* tokens appear via `classList.contains`, which would still
 *   pass if a regression added a stray third class (e.g. an accidental
 *   `play-iconbtn--cooldown` or `is-disabled` modifier baked into the
 *   markup) or reordered the tokens. This test pins the exact className
 *   string so token-set drift is caught at the unit level.
 *
 * Strategy mirrors PlayPageHintBtnClassName.test.tsx (W1254):
 *   - Hoisted fixture plugin with `hint()` defined so the iconbar branch
 *     (`phase === "playing" && hintsEnabled`) renders the button enabled.
 *   - Pre-seed `cards-hints-enabled = "true"` so the Settings gate is open
 *     and `cards-hint-cooldown = "false"` so no cooldown branch alters
 *     the rendered className.
 *   - Mount, click start-game, locate the button via its testid.
 *   - Assert `btn.className === "play-iconbtn play-hint-btn"` exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-btn-class-exact-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Button Class Exact Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the hint-button exact-className test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // Returning a selector that won't match anything is fine — this test
    // never clicks the button, it only inspects rendered attributes.
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

vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("cards-hints-enabled", "true");
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header hint button className exact equality (W1847)", () => {
  it("renders the hint button with className === 'play-iconbtn play-hint-btn' exactly so token-set drift is caught", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn");

    // Exact-equality contract — guards against extra modifier classes,
    // token reordering, or whitespace drift that `classList.contains`
    // assertions would silently accept.
    expect(btn.className).toBe("play-iconbtn play-hint-btn");
  });
});

void React;
