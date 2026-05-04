/**
 * Unit test for the PlayPage end-banner "share seed" (Copy link) button on
 * the LOSS path (W886).
 *
 * Observable behavior:
 *   The end-share-row (PlayPage.tsx ~line 2746) renders unconditionally
 *   for any terminal phase, and the `share-seed-end-btn` button inside it
 *   (PlayPage.tsx ~line 2763) is NOT gated on `isWin` — only the
 *   `play-save-replay` sibling carries the win-only guard. Clicking it on
 *   either terminal branch must call `navigator.clipboard.writeText` with
 *   a deep-link URL embedding the current seed as `?seed=<seed>`.
 *
 *   W678 pinned this contract on the WIN path. W877 pinned the "Copied!"
 *   label-flip on the WIN path. No test currently pins that the same
 *   `share-seed-end-btn` works on the LOSS path. A regression that wrapped
 *   the Copy-link button in an `isWin` gate, swapped its handler, or made
 *   `shareSeed` no-op on the loss branch would silently break the seed-
 *   share affordance for defeats while every existing share-row test
 *   continued to pass.
 *
 * Strategy mirrors W678's win-banner click test, but swaps the win
 * fixture for W845/W871's `isTerminal: { score: 0 }` loss fixture so
 * PlayPage walks the `isLoss === true` branch instead of the win
 * branch. After the loss banner mounts, click the `share-seed-end-btn`
 * and assert `navigator.clipboard.writeText` was called with a URL
 * containing the current seed.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — mirrors W845/W871. Reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action. `isTerminal` returning a
// zero-score payload is the canonical "loss" discriminator (PlayPage.tsx
// ~line 1389: `isLoss = phase === "ended" && finalScore !== null && !isWin`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-share-seed-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Share-Seed Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for loss-banner share-seed clipboard test.",
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

// Fixed seed so the asserted query-param value is deterministic and
// easy to triage if a future failure prints the writeText arguments.
const FIXED_SEED = 77;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage loss-banner share-seed button copies seed URL after loss (W886)", () => {
  it("clicking share-seed-end-btn after a terminal-loss calls clipboard.writeText with a URL containing the current seed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub the clipboard. `navigator.clipboard` is non-writable in jsdom
    // by default, hence the defineProperty dance — same pattern used by
    // W678 / seedCopy / friendCodeCopy sibling tests.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter
        initialEntries={[
          `/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}`,
        ]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-banner share button is NOT mounted before the
    // game ends — that's the visibility contract this test is pinning.
    expect(screen.queryByTestId("share-seed-end-btn")).toBeNull();

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity-check the loss branch is the one driving render — guards
    // against a fixture mis-wire that accidentally produced a positive
    // score and made this test trivially pass on the win path (which
    // W678 already covers).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-on-loss assertion: the Copy-link button must be mounted
    // on the loss path. (Per W866, the share-row is shared between win
    // and loss; only `play-save-replay` is win-gated.)
    const shareEndBtn = screen.getByTestId("share-seed-end-btn");
    expect(shareEndBtn).toBeTruthy();

    await act(async () => {
      fireEvent.click(shareEndBtn);
    });

    // The whole point of the test: writeText must be called with the
    // deep-link URL the user expects to paste. URL shape is
    // `${origin}/play/${plugin.id}?seed=${seed}` — substring-check the
    // seed query param so jsdom's origin can vary without breaking the
    // test, while still pinning the seed contract.
    expect(writeText).toHaveBeenCalledTimes(1);
    const arg = writeText.mock.calls[0]?.[0] as string;
    expect(typeof arg).toBe("string");
    expect(arg).toContain(`/play/${hoisted.TEST_GAME_ID}`);
    expect(arg).toContain(`seed=${FIXED_SEED}`);
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
