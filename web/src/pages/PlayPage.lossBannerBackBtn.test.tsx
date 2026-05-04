/**
 * Unit test for the PlayPage end-banner "back to lobby" link on the loss
 * path (W856).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2737-2743) renders an `end-actions` row inside the
 *   shared end-panel — i.e. *not* gated on `isWin` — that contains a
 *   React-Router `<Link to="/">` tagged `data-testid="end-back-btn"`.
 *   Sibling W813 pins the link's navigation contract on the WIN path
 *   (positive-score terminal). W845/W850 pin the loss-banner headline and
 *   end-seed copy on the LOSS path, but neither asserts that the
 *   back-to-lobby link still routes the player home when the round ends
 *   in defeat.
 *
 *   A regression that wrapped the Link in an `isWin && (...)` guard, that
 *   conditionally swapped the destination on loss (`to={isWin ? "/" : ...}`),
 *   or that replaced the Link with a no-op button on the loss branch would
 *   silently strip the most prominent "exit the round" affordance for
 *   losing players while every other end-panel test continued to pass.
 *
 * Strategy:
 *   Mirror W845's loss fixture — a reducer that flips into
 *   `isTerminal: { score: 0 }` on a single dispatched action — so PlayPage
 *   walks the loss branch (`isWin === false`, `isLoss === true`,
 *   `showLossBanner === true`). Reuse W813's `LocationProbe`/`useLocation`
 *   capture pattern: mount a probe at "/" inside the same `<Routes>` tree,
 *   click `end-back-btn`, and assert the probe reports `pathname === "/"`.
 *   `useLocation` (rather than a `useNavigate` mock) is correct here
 *   because the source uses `<Link to="/">` which hits RR's internals and
 *   would bypass any `useNavigate` stub.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — mirrors W845. Reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action; isTerminal returning a
// zero-or-negative score is the canonical "loss" discriminator (see
// PlayPage.tsx ~line 1240, `isWin = term.score > 0`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-back-btn-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Back Btn Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-banner back-to-lobby link on loss path.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ lost: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "LOSE" ? { lost: true } : s,
    isTerminal: (s: State) => (s.lost ? { score: 0 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-lose"
          onClick={() => dispatch({ type: "LOSE" })}
        >
          lose
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

// Probe component mounted at "/" so we can read back the post-click
// location. Using useLocation rather than mocking useNavigate is correct
// here because the source uses <Link to="/">, which hits RR's internals
// directly and would bypass any useNavigate stub.
function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="loc-probe">{loc.pathname}</div>;
}

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage loss-banner back-to-lobby link (W856)", () => {
  it("navigates to '/' when end-back-btn is clicked after a loss", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
          <Route path="/" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-back-btn isn't mounted before the game ends —
    // it lives inside the `phase === "ended"` branch.
    expect(screen.queryByTestId("end-back-btn")).toBeNull();

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Confirm the loss branch is the one driving render — guards against
    // a regression where a zero-score terminal accidentally takes the win
    // path and this test passes for the wrong reason.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-after-loss assertion: the back-to-lobby link must now
    // be mounted. A regression that gated the Link on `isWin` would
    // surface here.
    const backLink = screen.getByTestId("end-back-btn");
    expect(backLink).toBeTruthy();

    // Belt-and-suspenders: the rendered <a href> must point at "/".
    // RR's Link compiles `to="/"` to an anchor with href="/" — a
    // regression that swapped the destination on loss (e.g.
    // `to={isWin ? "/" : "/games"}`) would surface here even if
    // click-routing somehow still landed somewhere.
    expect(backLink.getAttribute("href")).toBe("/");

    // Click the link. RR intercepts the anchor click and pushes the
    // new history entry, which causes the Routes tree to swap the
    // PlayPage element for the LocationProbe mounted at "/".
    await act(async () => {
      fireEvent.click(backLink);
    });

    // Pin the contract: after click, the lobby probe is mounted and its
    // reported pathname is "/". This is the strongest possible
    // assertion that the Link actually navigated to the lobby route on
    // the loss path.
    const probe = screen.getByTestId("loc-probe");
    expect(probe.textContent).toBe("/");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
