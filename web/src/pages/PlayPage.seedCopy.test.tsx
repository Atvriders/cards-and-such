/**
 * Unit test for the PlayPage "share seed" / copy-seed button (W670).
 *
 * Observable behavior:
 *   The secondary toolbar exposes a `share-seed-btn` while `phase ===
 *   "playing"`. Clicking it must call `navigator.clipboard.writeText`
 *   exactly once with a deep-link URL that embeds the current seed as
 *   `?seed=<seed>`. That URL is the contract the share UI makes with
 *   the user — anyone they paste it to lands on the same hand — so the
 *   test pins both the call shape and the seed-bearing query param.
 *
 * Strategy:
 *   - Mirror the sibling friendCodeCopy / infoSeedShown tests: a
 *     `vi.hoisted` minimal fixture plugin keeps the registry mock
 *     deterministic without dragging in the real catalogue.
 *   - Stub `navigator.clipboard` via `Object.defineProperty` (jsdom
 *     marks it non-writable) with a `vi.fn().mockResolvedValue(undefined)`
 *     so the awaited `writeText` in `shareSeed` resolves and the call
 *     args are observable.
 *   - Mount with `?seed=42`, click `start-game` to enter the playing
 *     phase, then click `share-seed-btn` and assert the writeText call
 *     was made with a URL containing `?seed=42` for the fixture game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — `vi.hoisted` evaluates before `vi.mock` factory
// bodies, so the closure capture is safe despite the TDZ-looking pattern.
// Single-player shape: shareSeed doesn't depend on multiplayer flags, only
// on the resolved plugin id and current seed.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "seed-copy-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Seed Copy Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for share-seed clipboard tests.",
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

// Confetti pulls in canvas APIs jsdom doesn't implement; null-stub keeps
// the render side-effect-free even though this test never reaches the
// win banner.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

// Fixed seed so the asserted query-param value is deterministic and easy
// to triage if a future failure prints the writeText arguments.
const FIXED_SEED = 42;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage share-seed button copies seed URL to clipboard (W670)", () => {
  it("clicking share-seed-btn calls navigator.clipboard.writeText with a URL containing the current seed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub the clipboard. `navigator.clipboard` is non-writable in jsdom
    // by default, hence the defineProperty dance — same pattern used by
    // the friendCodeCopy sibling test.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
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

    // Advance past the setup screen so phase === "playing" and the
    // share-seed button mounts in the secondary toolbar.
    fireEvent.click(screen.getByTestId("start-game"));

    const shareBtn = screen.getByTestId("share-seed-btn");
    expect(shareBtn).toBeTruthy();

    await act(async () => {
      fireEvent.click(shareBtn);
    });

    // The whole point of the test: writeText must be called exactly once
    // with the deep-link URL the user expects to paste. The URL shape is
    // `${origin}/play/${plugin.id}?seed=${seed}` — assert via a substring
    // check on the seed query param so jsdom's origin can vary without
    // breaking the test, while still pinning the seed contract.
    expect(writeText).toHaveBeenCalledTimes(1);
    const arg = writeText.mock.calls[0]?.[0] as string;
    expect(typeof arg).toBe("string");
    expect(arg).toContain(`/play/${hoisted.TEST_GAME_ID}`);
    expect(arg).toContain(`seed=${FIXED_SEED}`);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
