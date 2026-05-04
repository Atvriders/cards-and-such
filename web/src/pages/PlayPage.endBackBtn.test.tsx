/**
 * Unit test for the PlayPage end-banner "back to lobby" link (W813).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~line 2737)
 *   renders an end-actions row containing a React-Router `<Link to="/">`
 *   tagged `data-testid="end-back-btn"` that returns the player to the
 *   lobby route. Sibling tests pin the win-banner score (W805), the
 *   "You won!" headline (W801), the Twitter share button (W810), the
 *   stats/time row (W812), and the share/save/print/replay controls
 *   (W678/W796/W778/W642/W699) — but no test pins the lobby-back link's
 *   navigation contract. A regression that swapped the destination,
 *   dropped the `to` prop, or replaced the Link with a no-op button would
 *   silently break the most prominent "exit the round" affordance while
 *   every other end-panel test continued to pass.
 *
 * Strategy mirrors W805's win-banner fixture pattern:
 *   - A hoisted fixture plugin whose reducer flips `isTerminal` to a
 *     positive-score payload after one dispatch drives PlayPage into the
 *     terminal-win branch with `?quickstart=1` skipping setup.
 *   - Because `end-back-btn` is a React-Router `<Link>` (not a button
 *     wired to `useNavigate`), the cleanest contract pin is a
 *     `LocationProbe` mounted on `/` inside the same `<Routes>` tree —
 *     a `useNavigate` mock would never fire for a Link's internal nav.
 *   - After the win, click `end-back-btn` and assert the LocationProbe
 *     reports `pathname === "/"`, pinning the destination route.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload once `moves >= 1`, so a single dispatch from
// the fixture button drives PlayPage into the terminal-win branch and
// mounts the `end-back-btn` link inside the end-actions row.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-back-btn-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Back Btn Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-banner back-to-lobby link test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 100 } : null,
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

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// win-banner render fast and side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

// Probe component mounted at "/" so we can read back the post-click
// location. Using useLocation rather than mocking useNavigate is
// correct here because the source uses <Link to="/">, which hits RR's
// internals directly and would bypass any useNavigate stub.
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

describe("PlayPage end-banner back-to-lobby link (W813)", () => {
  it("navigates to '/' when end-back-btn is clicked after a win", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
          <Route path="/" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-back-btn isn't mounted before the game ends —
    // it lives inside the `phase === "ended"` branch.
    expect(screen.queryByTestId("end-back-btn")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the back-to-lobby link must now
    // be mounted. A regression that dropped the data-testid would
    // surface here even if the destination remained correct.
    const backLink = screen.getByTestId("end-back-btn");
    expect(backLink).toBeTruthy();

    // Belt-and-suspenders: the rendered <a href> must point at "/".
    // RR's Link compiles `to="/"` to an anchor with href="/" — a
    // regression that hard-coded the wrong path would surface here
    // even if click-routing somehow still landed on the lobby.
    expect(backLink.getAttribute("href")).toBe("/");

    // Click the link. RR intercepts the anchor click and pushes the
    // new history entry, which causes the Routes tree to swap the
    // PlayPage element for the LocationProbe mounted at "/".
    await act(async () => {
      fireEvent.click(backLink);
    });

    // Pin the contract: after click, the lobby probe is mounted and
    // its reported pathname is "/". This is the strongest possible
    // assertion that the Link actually navigated to the lobby route.
    const probe = screen.getByTestId("loc-probe");
    expect(probe.textContent).toBe("/");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
