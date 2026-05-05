/**
 * Unit test for the PlayPage end-panel `onClick` stopPropagation contract (W1751).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2661) renders the end-panel `<section>` with
 *   `onClick={(e) => e.stopPropagation()}`. The ancestor `.play-page`
 *   container (~line 1661) installs `onClick={onPrimaryClick}` which
 *   walks the click target's ancestry and emits sparkle particles for
 *   primary buttons / iconbuttons. Without the end-panel's
 *   stopPropagation, every click inside the terminal end-panel would
 *   bubble through React's synthetic-event system to `.play-page`,
 *   re-running the `closest(".btn-primary, .play-iconbtn")` hit-test on
 *   children of the end-panel and double-firing ambient play-area
 *   effects on a surface that's supposed to be its own self-contained
 *   modal.
 *
 *   None of the end-panel sibling tests (W1745 sectionTag, W1732/W1739
 *   modifiers, W1674 dialog role, W1684 aria-modal, W858/W863
 *   aria-label, W811 data-win) pin this behavior — they all assert
 *   static attributes on the section and ignore the click-propagation
 *   contract. A regression that dropped the onClick handler, replaced
 *   it with a no-op, or removed the `e.stopPropagation()` call would
 *   silently start re-running the parent's hit-test for every click
 *   inside the end-panel while every existing structural test stayed
 *   green.
 *
 * Strategy:
 *   Mirror the win-banner fixture pattern used by W1684 / W1674 so a
 *   single dispatch drives PlayPage into the terminal-win branch and
 *   mounts the end-panel. Wrap PlayPage in a host component whose root
 *   `<div>` installs a React `onClick` spy — this lives at the React
 *   synthetic-event layer that the end-panel's
 *   `onClick={(e) => e.stopPropagation()}` is designed to short-circuit.
 *
 *   Sanity-check the harness by firing a click on the host wrapper
 *   itself first — the spy MUST fire there, otherwise the React event
 *   wiring is wrong and we'd be asserting a tautology. Then click an
 *   element inside the end-panel: if stopPropagation is honored React's
 *   synthetic-event bubble never reaches the host wrapper and the spy
 *   stays at one call. If the contract is broken the spy fires twice.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — same shape as W1684 / W1674. Reducer increments
// `moves`, isTerminal returns a positive-score payload as soon as
// `moves >= 1`, so a single dispatch from the fixture button drives
// PlayPage into the terminal-win branch that mounts the end-panel.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-panel-stop-prop-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Panel StopProp Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-panel stopPropagation contract.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 7 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-win"
          type="button"
          onClick={() => dispatch({ type: "win-now" })}
        >
          win
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal-win render side-effect-free.
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

describe("PlayPage end-panel: onClick stops React click propagation past .play-page (W1751)", () => {
  it("does not bubble React synthetic clicks from inside the end-panel up past the .play-page wrapper", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const wrapperSpy = vi.fn();

    render(
      <div data-testid="host-wrapper" onClick={wrapperSpy}>
        <MemoryRouter
          initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
        >
          <Routes>
            <Route path="/play/:gameId" element={<PlayPage />} />
          </Routes>
        </MemoryRouter>
      </div>,
    );

    // Drive the round to terminal-win — mounts the end-panel.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });
    // Reset the spy after the fixture click — that click bubbled through
    // the host wrapper too, but it's not what we want to measure.
    wrapperSpy.mockClear();

    const endPanel = screen.getByTestId("end-panel");
    const host = screen.getByTestId("host-wrapper");

    // Sanity: a React synthetic click on the host wrapper itself fires
    // the spy. Without this we'd be asserting a tautology where the
    // listener never fires for any reason.
    fireEvent.click(host);
    expect(wrapperSpy).toHaveBeenCalledTimes(1);

    // The contract pin: a React synthetic click *inside* the end-panel
    // must NOT bubble past it to the host wrapper. We click the
    // new-game button — it lives inside the end-panel and is the most
    // likely real-user click target on the win screen. After the
    // click, the spy count is unchanged from the sanity tick (still 1),
    // proving the end-panel's `onClick={(e) => e.stopPropagation()}`
    // swallowed the React synthetic-event bubble before it could reach
    // the host wrapper's React onClick.
    const newGameBtn = screen.getByTestId("new-game-btn");
    // Confirm the button truly is inside the end-panel before the
    // assertion — otherwise we'd be measuring the wrong subtree.
    expect(endPanel.contains(newGameBtn)).toBe(true);
    fireEvent.click(newGameBtn);
    expect(wrapperSpy).toHaveBeenCalledTimes(1);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
