/**
 * Unit test for the PlayPage end-banner "share to Twitter" button (W810).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage renders a row
 *   of share controls including a button with `data-testid="end-share-twitter"`.
 *   Clicking it invokes the `shareToTwitter` callback (PlayPage.tsx ~line 1417),
 *   which constructs a Twitter web-intent URL of the form
 *   `https://twitter.com/intent/tweet?text=...&url=...` and hands it to
 *   `window.open(...)`. Sibling tests cover the share-seed copy (W678),
 *   save-image (W796), print (W778), save-replay (W642/W699), and the win
 *   banner score/headline (W805/W801) — but no test pins the Twitter intent
 *   wiring. A regression that swapped the intent host, dropped the click
 *   handler, or stopped opening the URL would silently break the social
 *   share path while every other end-panel test continued to pass.
 *
 * Strategy mirrors W805's win-banner fixture pattern:
 *   - A hoisted fixture plugin whose reducer flips `isTerminal` to a
 *     positive-score payload after one dispatch drives PlayPage into the
 *     terminal-win branch with `?quickstart=1` skipping setup.
 *   - `window.open` is stubbed via `Object.defineProperty` (jsdom does
 *     ship a `window.open` stub but reassigning it is the standard way to
 *     observe calls) with a vi.fn so we can assert the call shape.
 *   - After the win, click `end-share-twitter` and pin both the call
 *     happening at all and the URL matching the Twitter intent format.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload once `moves >= 1`, so a single dispatch from
// the fixture button drives PlayPage into the terminal-win branch and
// mounts the `end-share-twitter` button inside the end-share-row.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-share-twitter-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Share Twitter Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-banner Twitter-share intent test.",
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

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage end-banner Twitter share button (W810)", () => {
  it("opens a Twitter intent URL when end-share-twitter is clicked after a win", async () => {
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
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the end-share-twitter button isn't mounted before
    // the game ends — it lives inside the `phase === "ended"` branch.
    expect(screen.queryByTestId("end-share-twitter")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the Tweet button must now be mounted.
    const tweetBtn = screen.getByTestId("end-share-twitter");
    expect(tweetBtn).toBeTruthy();

    // Click it. shareToTwitter calls window.open with the intent URL.
    await act(async () => {
      fireEvent.click(tweetBtn);
    });

    // Pin the contract: window.open was invoked at least once with a
    // Twitter (or x.com) intent URL. The regex tolerates either host
    // since the codebase has historically used both, while still rejecting
    // a regression that points the share at the wrong service entirely.
    expect(openSpy).toHaveBeenCalled();
    const firstCallUrl = String(openSpy.mock.calls[0][0]);
    expect(firstCallUrl).toMatch(
      /^https:\/\/(twitter|x)\.com\/intent\/tweet\?/,
    );
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
