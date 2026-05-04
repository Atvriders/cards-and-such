/**
 * W1040 — PlayPage overflow ("more actions") menu closes on Escape.
 *
 * Companion to W1016 (PlayPage.overflowBtnToggle.test.tsx) which pins the
 * OPEN path (click ••• flips aria-expanded + data-overflow-open from
 * "false" to "true"). W1040 covers the symmetric CLOSE path that
 * PlayPage.tsx (~line 697-722) wires up through a dedicated useEffect:
 * while `overflowOpen` is true, a window-level capture-phase keydown
 * listener calls `setOverflowOpen(false)` on Escape. The same effect also
 * registers an outside-click mousedown handler, but Escape is the most
 * deterministic trigger to assert in jsdom — outside-click depends on
 * pointer-event geometry that jsdom doesn't fully simulate.
 *
 * A regression that:
 *   - removed the keydown listener,
 *   - forgot to call `setOverflowOpen(false)` inside the Escape branch,
 *   - bound the listener to the wrong element / phase, or
 *   - left the menu's data-overflow-open hard-wired to a stale value
 * would silently leave mobile players unable to dismiss the overflow
 * popover, trapping focus inside it. Pinning BOTH attributes (the button's
 * aria-expanded AND the menu's data-overflow-open) catches a partial
 * regression where one binding stayed correct but the other diverged.
 *
 * Strategy mirrors the W1016 OPEN test plus the W992 close-via-Escape
 * dispatch pattern from PlayPage.seedPickClose.test.tsx:
 *   - Hoisted fixture plugin keeps the render fast / deterministic.
 *   - Mount at `/play/:gameId`, click `start-game` to enter the playing
 *     phase (overflow button is gated by `phase === "playing"`).
 *   - Click `play-overflow-btn` to OPEN the menu — sanity-check both
 *     attributes flipped to "true" (a precondition for the close assertion
 *     to be meaningful).
 *   - Dispatch `keyDown` on `window` for Escape (matches PlayPage's
 *     capture-phase window listener registration).
 *   - Re-read both attributes — they MUST be back to "false".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "overflow-close-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Overflow Close Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the overflow-menu Escape-close test.",
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

describe("PlayPage overflow menu close (W1040)", () => {
  it("flips aria-expanded and data-overflow-open back to 'false' when Escape is pressed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the overflow button mounts (gated by
    // `phase === "playing"`).
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-overflow-btn");
    const menu = screen.getByTestId("play-toolbar-secondary");

    // OPEN the menu — this is the precondition for the close assertion.
    // Sanity-check both endpoints flipped to "true" so a regression in
    // the OPEN path doesn't masquerade as a passing CLOSE test.
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(menu.getAttribute("data-overflow-open")).toBe("true");

    // Press Escape — PlayPage binds the keydown listener to `window`
    // (capture phase) inside the `overflowOpen` useEffect, so dispatching
    // on `window` mirrors how a real browser delivers the event.
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    // After Escape: both endpoints of the `overflowOpen` binding MUST be
    // back to "false". Asserting BOTH catches a partial regression that
    // updated one but not the other (e.g. removed the setOverflowOpen
    // call but left a stale aria-expanded value, or vice versa).
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(menu.getAttribute("data-overflow-open")).toBe("false");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
