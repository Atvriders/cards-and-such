/**
 * Unit test for the PlayPage end-banner share-seed button label flip
 * after a successful copy (W877).
 *
 * Observable behavior pinned here:
 *   The end-banner `share-seed-end-btn` (sibling to `end-share-twitter`
 *   W810/W871 and `play-share-image` W796 inside `end-share-row`) renders
 *   its own dynamic label based on the page's `shareStatus` state. The
 *   seed-clipboard contract itself (writeText shape) is already covered
 *   by W678 in PlayPage.shareEnd.test.tsx — what is NOT covered there is
 *   the visible *label* swap from "Copy link" → "Copied!" once the
 *   clipboard write resolves successfully. That label is the only
 *   feedback the user gets after clicking, so it deserves its own pin.
 *
 * Strategy mirrors PlayPage.shareEnd.test.tsx: hoisted fixture plugin
 * with a one-dispatch terminal-win, `?quickstart=1` to skip setup,
 * `?seed=77` for a deterministic URL, and `navigator.clipboard.writeText`
 * stubbed via `Object.defineProperty` to a vi.fn that resolves so the
 * `await` inside `shareSeed` settles and `setShareStatus("copied")` runs
 * before the assertion. We deliberately do NOT advance fake timers,
 * because the 1800ms reset back to "Copy link" is a separate concern; we
 * just want to see "Copied!" right after the click resolves.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: identical pattern to PlayPage.shareEnd.test.tsx — one
// click of `fx-win` flips `isTerminal` to a positive-score payload, so
// PlayPage transitions into phase="ended" with isWin=true and mounts
// the `share-seed-end-btn` we're about to inspect.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-end-copied-label-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share End Copied Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for end-banner share-seed label-flip pin (W877).",
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
  vi.restoreAllMocks();
});

describe("PlayPage end-banner share-seed-end-btn label flips to 'Copied!' after a successful clipboard write (W877)", () => {
  it("renders 'Copy link' before click and 'Copied!' immediately after writeText resolves", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub clipboard with a resolving spy. Same defineProperty dance as
    // the W678 sibling test — jsdom marks navigator.clipboard non-writable
    // by default, so plain assignment would throw.
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
    // This is the load-bearing assertion that distinguishes this test
    // from W678 (which only checks the writeText payload).
    expect(shareEndBtn.textContent).toBe("Copy link");

    // Click and let the awaited writeText resolve so the
    // `setShareStatus("copied")` branch runs before we re-read the label.
    await act(async () => {
      fireEvent.click(shareEndBtn);
    });

    // Post-condition: shareStatus === "copied" → label reads "Copied!".
    // We deliberately do NOT advance the 1800ms reset timer here — that
    // would be a separate test; the label-flip on success is the
    // observable contract we want pinned for this row.
    expect(shareEndBtn.textContent).toBe("Copied!");
    // Sanity: the click actually went through clipboard, not some other
    // path. Cheap guardrail so a future refactor that disables the
    // button or swallows the click won't make this test pass vacuously.
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
