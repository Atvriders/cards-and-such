/**
 * Unit test for the PlayPage header hint button className contract (W1254).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2012) renders the hint button with the className
 *   pair `play-iconbtn play-hint-btn`. The `play-iconbtn` class hooks the
 *   button into the shared header iconbar styling (size, hover ring,
 *   focus outline, and the CSS hover-tooltip that consumes the
 *   `data-tooltip` attribute pinned by W953). The `play-hint-btn`
 *   class is the per-button hook used to override or extend the shared
 *   styles for the hint button specifically (e.g. the lightbulb glyph
 *   coloring, label sizing). Sibling tests cover the button's
 *   `type`/`aria-label`/SVG glyph (W922), the `data-tooltip` attribute
 *   (W953), the static title (W1163/W1169) and the cooldown title/label
 *   (W1157), but no test pins the className pair — a regression that
 *   stripped `play-iconbtn` (breaking the hover ring + tooltip surface)
 *   or renamed `play-hint-btn` (breaking the per-button hook) would slip
 *   past every existing test.
 *
 * Strategy mirrors PlayPage.headerHintButton.test.tsx (W922):
 *   - Hoisted fixture plugin with `hint()` defined so the iconbar branch
 *     (`phase === "playing" && hintsEnabled`) renders the button as
 *     enabled.
 *   - Pre-seed `cards-hints-enabled = "true"` so the Settings gate is open
 *     and `cards-hint-cooldown = "false"` so the className doesn't change
 *     under a cooldown branch (the className itself is static — pinning
 *     the steady-state is enough).
 *   - Mount, click start-game, locate the button via its testid.
 *   - Assert classList contains both `play-iconbtn` and `play-hint-btn`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-btn-classname-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Button ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header hint-button className test.",
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

describe("PlayPage header hint button className contract (W1254)", () => {
  it("renders the hint button with both 'play-iconbtn' and 'play-hint-btn' classes so the shared iconbar styling and per-button hook stay wired", async () => {
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

    // Shared iconbar hook — drives size, hover ring, focus outline, and
    // the CSS hover-tooltip surface that W953's `data-tooltip` feeds.
    expect(btn.classList.contains("play-iconbtn")).toBe(true);

    // Per-button hook — used to scope hint-specific styling (glyph color,
    // label sizing) without affecting other iconbar buttons.
    expect(btn.classList.contains("play-hint-btn")).toBe(true);
  });
});

void React;
