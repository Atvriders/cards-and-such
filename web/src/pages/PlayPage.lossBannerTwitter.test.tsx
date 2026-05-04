/**
 * Unit test for the PlayPage end-banner "share to Twitter" button on the
 * LOSS path (W871).
 *
 * Observable behavior:
 *   The end-share-row (PlayPage.tsx ~line 2746) renders unconditionally
 *   for any terminal phase, and the `end-share-twitter` button inside it
 *   is NOT gated on `isWin` — only the `play-save-replay` sibling carries
 *   the win-only guard (see W866 for the absence-on-loss assertion).
 *   `shareToTwitter` (PlayPage.tsx ~line 1417) uses `finalScore ?? 0`, so
 *   a zero-score loss still produces a valid intent URL.
 *
 *   W810 pinned the WIN-path Twitter intent click. No test currently
 *   pins the LOSS-path equivalent. A regression that wrapped the Twitter
 *   button in an `isWin` gate, swapped the intent host, dropped the
 *   click handler, or stopped opening the URL on the loss banner would
 *   silently break the social share path for defeats while every
 *   existing share-row test continued to pass.
 *
 * Strategy mirrors W810's win-banner click test, but with W845's
 * `isTerminal: { score: 0 }` loss fixture so PlayPage walks the
 * `isLoss === true` branch instead of the win branch. Click the
 * `end-share-twitter` button after the loss banner mounts and observe
 * `window.open` was invoked with a Twitter/x.com intent URL.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — mirrors W845/W866. Reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action. `isTerminal` returning a
// zero-score payload is the canonical "loss" discriminator (PlayPage.tsx
// ~line 1389: `isLoss = phase === "ended" && finalScore !== null && !isWin`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-twitter-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Twitter Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner Twitter share intent test.",
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
// terminal render fast and side-effect-free. (The loss path doesn't
// trigger confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss-banner Twitter share button (W871)", () => {
  it("opens a Twitter intent URL when end-share-twitter is clicked after a loss", async () => {
    // Stub window.open so we can observe the share call. jsdom's default
    // implementation is a no-op stub that we override here with a spy.
    const openSpy = vi.fn();
    Object.defineProperty(window, "open", {
      value: openSpy,
      configurable: true,
      writable: true,
    });

    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity-check the loss branch is the one driving render — guards
    // against a fixture mis-wire that accidentally produced a positive
    // score and made this test trivially pass on the win path (which
    // W810 already covers).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-on-loss assertion: the Tweet button must be mounted on
    // the loss path. (Per W866, the share-row is shared between win and
    // loss; only `play-save-replay` is win-gated.)
    const tweetBtn = screen.getByTestId("end-share-twitter");
    expect(tweetBtn).toBeTruthy();

    // Click it. shareToTwitter calls window.open with the intent URL,
    // using `finalScore ?? 0` so a zero-score loss still produces a
    // valid intent.
    await act(async () => {
      fireEvent.click(tweetBtn);
    });

    // Pin the contract: window.open was invoked at least once with a
    // Twitter (or x.com) intent URL. The regex tolerates either host
    // since the codebase has historically used both, while still
    // rejecting a regression that points the share at the wrong service
    // entirely or drops the click handler on the loss path.
    expect(openSpy).toHaveBeenCalled();
    const firstCallUrl = String(openSpy.mock.calls[0][0]);
    expect(firstCallUrl).toMatch(
      /^https:\/\/(twitter|x)\.com\/intent\/tweet\?/,
    );
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
