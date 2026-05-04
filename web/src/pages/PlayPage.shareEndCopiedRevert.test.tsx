/**
 * Unit test for the PlayPage end-banner share-seed button label REVERT
 * after the post-copy hold window (W883).
 *
 * Companion to W877 (`PlayPage.shareEndCopiedLabel.test.tsx`), which pins
 * the "Copy link" → "Copied!" flip the moment the awaited
 * `navigator.clipboard.writeText` resolves. That sibling test
 * deliberately stops there — it does NOT advance any timers, because the
 * 1800ms revert back to "Copy link" is its own observable contract that
 * deserves its own pin so a refactor that drops the
 * `setTimeout(() => setShareStatus("idle"), 1800)` (PlayPage.tsx, in
 * `shareSeed`) won't regress silently with W877 still passing.
 *
 * Observable behavior pinned here:
 *   1. Pre-click, the end-banner `share-seed-end-btn` reads "Copy link".
 *   2. Right after a successful copy, it reads "Copied!" (the W877 flip).
 *   3. After the 1800ms hold elapses, the trailing setTimeout fires and
 *      flips `shareStatus` back to `"idle"`, restoring the "Copy link"
 *      label so a second click can still surface the "Copied!" feedback.
 *
 * Strategy mirrors W725 (`PlayPage.hintTooltip.test.tsx`): install fake
 * timers with `shouldAdvanceTime: true` BEFORE mount so any mount-phase
 * microtasks aren't frozen on the virtual clock, then drive the timer
 * across the 1800ms boundary. The clipboard stub mirrors W877 so the
 * awaited writeText resolves and the `setShareStatus("copied")` branch
 * runs before the assertion.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: identical pattern to PlayPage.shareEndCopiedLabel.test.tsx
// — one click of `fx-win` flips `isTerminal` to a positive-score payload, so
// PlayPage transitions into phase="ended" with isWin=true and mounts the
// `share-seed-end-btn` whose label we're inspecting before/after the
// 1800ms revert window.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-end-copied-revert-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share End Copied Revert Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for end-banner share-seed label-revert pin (W883).",
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

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal-win render side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

const FIXED_SEED = 77;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage end-banner share-seed-end-btn label reverts to 'Copy link' after the 1800ms hold (W883)", () => {
  it("flips to 'Copied!' on successful copy and reverts to 'Copy link' once the 1800ms timer fires", async () => {
    // Install fake timers BEFORE mount per the W725 / W698 pattern so any
    // mount-phase setTimeout / setInterval registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks (including the awaited clipboard writeText resolution
    // we trigger below) from deadlocking on the frozen clock.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub clipboard with a resolving spy. Same defineProperty dance as
    // the W877 sibling — jsdom marks navigator.clipboard non-writable by
    // default, so plain assignment would throw.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter
        initialEntries={[
          `/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}&quickstart=1`,
        ]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive into terminal-win so the end-banner mounts.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const shareEndBtn = screen.getByTestId("share-seed-end-btn");
    // Pre-condition: idle status renders the default "Copy link" label.
    expect(shareEndBtn.textContent).toBe("Copy link");

    // Click and let the awaited writeText resolve so the
    // `setShareStatus("copied")` branch runs before we re-read the label.
    await act(async () => {
      fireEvent.click(shareEndBtn);
    });

    // W877 contract: the click + resolved clipboard write flips the
    // label to "Copied!". This is the precondition for the revert
    // assertion that follows — without it the post-1800ms read would
    // tell us nothing about the timer. We deliberately do NOT assert
    // a "still Copied! at 1799ms" boundary because the test installs
    // `shouldAdvanceTime: true`, which means the awaited
    // `writeText`/`act` above already let the virtual clock drift
    // forward by some tens of real-elapsed milliseconds — picking a
    // hard pre-revert boundary would race that drift. The contract
    // we actually care about is the eventual revert.
    expect(shareEndBtn.textContent).toBe("Copied!");

    // Advance past the 1800ms revert window so the trailing
    // setTimeout inside `shareSeed` fires `setShareStatus("idle")`,
    // restoring the default "Copy link" label. Use a comfortably
    // larger advance (2000ms) so the assertion isn't sensitive to
    // any small clock-drift introduced by `shouldAdvanceTime`.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(shareEndBtn.textContent).toBe("Copy link");

    // Sanity: the click actually went through clipboard, not some other
    // path. Cheap guardrail so a future refactor that disables the
    // button or swallows the click won't make this test pass vacuously.
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
