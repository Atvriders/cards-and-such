/**
 * W1052 — PlayPage overflow ("more actions") menu closes on outside-click.
 *
 * Companion to W1040 (PlayPage.overflowClose.test.tsx) which pins the
 * Escape-close path. W1052 covers the OTHER dismissal trigger registered
 * by the same useEffect in PlayPage.tsx (~line 697-722): a window-level
 * mousedown listener that calls `setOverflowOpen(false)` whenever the
 * pointer lands outside both the overflow button and the menu container.
 *
 * The two close paths share an effect but are independently breakable:
 *   - Removing the mousedown listener (or its registration) would leave
 *     keyboard users covered while silently breaking the touch / mouse
 *     dismissal that mobile players actually rely on.
 *   - Mis-wiring the `contains` guards (e.g. swapped refs, inverted
 *     condition) would either swallow legitimate clicks inside the menu
 *     or fail to close on truly external clicks.
 *   - Forgetting to clean up the listener when `overflowOpen` flips back
 *     to false would leak handlers across renders.
 *
 * Pinning BOTH attributes (the button's aria-expanded AND the menu's
 * data-overflow-open) catches a partial regression where one binding
 * stayed correct but the other diverged — same defense-in-depth strategy
 * W1016 / W1040 use for the OPEN and Escape-close paths.
 *
 * Strategy mirrors W1040 with the trigger swapped from a window keydown
 * to a mousedown dispatched on `document.body`:
 *   - Hoisted fixture plugin keeps the render fast / deterministic.
 *   - Mount at `/play/:gameId`, click `start-game` to enter the playing
 *     phase (overflow button is gated by `phase === "playing"`).
 *   - Click `play-overflow-btn` to OPEN the menu — sanity-check both
 *     attributes flipped to "true" (precondition for a meaningful close).
 *   - Dispatch `mousedown` on `document.body` (a node neither ref
 *     contains) — this is exactly what the listener treats as an
 *     "outside" click.
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
  const TEST_GAME_ID = "overflow-outside-click-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Overflow OutsideClick Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the overflow-menu outside-click test.",
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

describe("PlayPage overflow menu close via outside-click (W1052)", () => {
  it("flips aria-expanded and data-overflow-open back to 'false' when mousedown fires outside the menu", async () => {
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

    // Dispatch mousedown on document.body — a node that neither
    // overflowMenuRef nor overflowBtnRef contains, so the listener's
    // `contains` guards both fall through to `setOverflowOpen(false)`.
    // PlayPage binds the listener to `window`, but mousedown bubbles
    // from body through window so dispatching on body matches what a
    // real browser delivers when the user taps empty page chrome.
    act(() => {
      fireEvent.mouseDown(document.body);
    });

    // After the outside mousedown: both endpoints of the `overflowOpen`
    // binding MUST be back to "false". Asserting BOTH catches a partial
    // regression that updated one but not the other (e.g. removed the
    // setOverflowOpen call but left a stale aria-expanded value).
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(menu.getAttribute("data-overflow-open")).toBe("false");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
