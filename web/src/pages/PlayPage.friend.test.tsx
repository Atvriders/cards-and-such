/**
 * Unit tests for PlayPage friend mode (W181 / W202 / W400).
 *
 * Three observable behaviors of the friend-share flow:
 *   1. The `play-friend-btn` toolbar button only renders when the active
 *      plugin opts in via `plugin.players.multiplayer === true`.
 *   2. Clicking the button calls `shareFriendLink`, which builds a URL of
 *      the form `${origin}/play/${gameId}?seed=${seed}&friend=1`,
 *      copies it to the clipboard, and bumps the
 *      `cards-friend-sessions` localStorage counter.
 *   3. Visiting `?friend=1` puts the page in friend mode, which renders
 *      the `play-friend-banner` together with a friend code button and
 *      QR-code SVG.
 *
 * Strategy:
 *   - `vi.hoisted` builds a single fixture plugin so the same instance
 *     is referenced by the `../games/registry.js` mock in both tests.
 *     A `multiplayer` flag is exposed via a getter so individual tests
 *     can flip it before mounting — exercising the "off" path is just
 *     as important as the "on" path so a future refactor that drops the
 *     guard can't slip past CI.
 *   - The clipboard is stubbed via `Object.defineProperty` on
 *     `navigator` so `writeText` resolves synchronously without needing
 *     a real Clipboard implementation.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. The `state.multiplayer` flag is
// reflected at render time via a getter on `players`, so individual
// tests can flip the flag before mounting and the registry mock will
// pick it up without re-import.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const state = { multiplayer: true };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend test)",
    category: "solitaire" as const,
    get players() {
      return { min: 1, max: 2, multiplayer: state.multiplayer };
    },
    description: "Friend-mode test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (s: { seed: number }) => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin, state };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Stable seed in URL so the share-URL assertion is exact.
const FIXED_SEED = 42;

beforeEach(() => {
  localStorage.clear();
  hoisted.state.multiplayer = true;
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

async function mountPlaying(query = `?seed=${FIXED_SEED}`): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}${query}`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId("start-game"));
}

describe("PlayPage friend mode (W181/W202/W400)", () => {
  it("only renders play-friend-btn when plugin.players.multiplayer is true", async () => {
    // Off path first — guard must hide the button entirely.
    hoisted.state.multiplayer = false;
    await mountPlaying();
    expect(screen.queryByTestId("play-friend-btn")).toBeNull();

    // Tear down the first tree before mounting another PlayPage so the
    // assertions below aren't ambiguous about which instance they hit.
    cleanup();

    hoisted.state.multiplayer = true;
    await mountPlaying();
    expect(screen.getByTestId("play-friend-btn")).toBeTruthy();
  });

  it("share builds correct URL with seed+friend=1 and bumps cards-friend-sessions", async () => {
    await mountPlaying();

    // Stub the clipboard so `writeText` resolves and we can read the
    // value back. `navigator.clipboard` is non-writable in jsdom by
    // default, hence the defineProperty dance.
    let copied: string | null = null;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(async (text: string) => {
          copied = text;
        }),
      },
    });

    expect(localStorage.getItem("cards-friend-sessions")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByTestId("play-friend-btn"));
    });

    const expected = `${window.location.origin}/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}&friend=1`;
    expect(copied).toBe(expected);
    // Counter starts at 0 -> 1 after a single share.
    expect(localStorage.getItem("cards-friend-sessions")).toBe("1");

    // A second click should bump it again — confirms the `+1` path
    // round-trips the existing value, not just initializes.
    await act(async () => {
      fireEvent.click(screen.getByTestId("play-friend-btn"));
    });
    expect(localStorage.getItem("cards-friend-sessions")).toBe("2");
  });

  it("?friend=1 URL shows play-friend-banner with friend code + QR", async () => {
    await mountPlaying(`?seed=${FIXED_SEED}&friend=1`);

    const banner = screen.getByTestId("play-friend-banner");
    expect(banner).toBeTruthy();
    // Friend code button is rendered inside the banner when the game
    // is registered in the friend-code dictionary (our fixture is the
    // only entry, so it always resolves).
    expect(screen.getByTestId("play-friend-code")).toBeTruthy();
    // QR SVG is the third visual artifact promised by the banner.
    expect(screen.getByTestId("play-friend-qr")).toBeTruthy();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
