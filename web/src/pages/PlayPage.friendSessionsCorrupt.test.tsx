/**
 * Unit test for the friend-session counter's corrupt-value recovery (W722).
 *
 * Observable behavior:
 *   `cards-friend-sessions` is a tiny localStorage counter bumped each
 *   time a user copies a friend-share link. The bumper reads the current
 *   value via `Number.parseInt`, then -- and this is the bit nothing else
 *   covers -- guards the resulting number with `Number.isFinite(cur) ? cur
 *   : 0` before adding 1. That guard is the difference between a single
 *   corrupt entry (e.g. an extension or a previous bug wrote "NaN" or
 *   "abc") permanently sticking the counter at NaN, and a self-healing
 *   reset to 1 on the next share.
 *
 *   Sibling test PlayPage.friend.test.tsx already covers the null -> 1 ->
 *   2 sequential-increment path, but never exercises a non-numeric
 *   starting value. So the recovery branch -- which is the *whole point*
 *   of the `Number.isFinite` guard -- is currently dead from CI's
 *   perspective.
 *
 * Strategy:
 *   - Mirror the hoisted multiplayer-fixture pattern from
 *     PlayPage.friend.test.tsx so the registry mock returns a single
 *     deterministic plugin and the toolbar's `play-friend-btn` is
 *     guaranteed to render.
 *   - Pre-seed `cards-friend-sessions` with a non-numeric string ("oops")
 *     before mounting. After clicking the share button, the counter must
 *     read exactly "1" -- proving the bumper treated the corrupt value
 *     as zero rather than NaN-propagating into the stored value (which
 *     would either persist NaN or crash a future read).
 *   - Stub `navigator.clipboard.writeText` so the share handler runs to
 *     completion without jsdom's missing-clipboard exception. The
 *     clipboard contract itself is owned by the sibling tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Same shape as the sibling
// friend-mode tests so the registry mock resolves to a single plugin at
// dictionary slot 0 -- guaranteeing the share button renders and the
// click handler reaches `bumpFriendSessions`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-sessions corrupt-value test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-sessions corrupt-value recovery test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (s: { seed: number }) => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

const FIXED_SEED = 42;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage friend-sessions corrupt-value recovery (W722)", () => {
  it("resets a non-numeric cards-friend-sessions value to 1 on the next share", async () => {
    // Pre-seed the counter with garbage that `Number.parseInt` resolves
    // to `NaN`. Without the `Number.isFinite` guard in `bumpFriendSessions`
    // the bumper would store "NaN" (or worse, propagate it through future
    // reads), so this is the canonical regression input.
    localStorage.setItem("cards-friend-sessions", "oops");

    const { default: PlayPage } = await import("./PlayPage.js");

    // jsdom's navigator.clipboard is non-writable by default; the
    // defineProperty dance mirrors PlayPage.friend.test.tsx. We provide
    // a no-op writeText so the share handler resolves cleanly -- the
    // clipboard contract itself is owned by the sibling tests.
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async (_text: string) => {}) },
    });

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    await act(async () => {
      fireEvent.click(screen.getByTestId("play-friend-btn"));
    });

    // The recovery contract: corrupt -> treated as 0 -> +1 -> "1".
    // Anything else (notably the literal string "NaN") would mean the
    // `Number.isFinite` guard regressed and a single corrupt entry now
    // sticks the counter forever.
    expect(localStorage.getItem("cards-friend-sessions")).toBe("1");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
