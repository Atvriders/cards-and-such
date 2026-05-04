/**
 * Unit test for the PlayPage `share-seed-btn` data-tooltip in the COPIED
 * state (W1207).
 *
 * Companion to W1205 (`PlayPage.shareSeedBtnTooltip.test.tsx`), which
 * pins the IDLE branch of the dynamic ternary
 *   `data-tooltip={shareStatus === "copied" ? "Copied!" : "Share seed"}`
 * (PlayPage.tsx ~line 2092). That sibling test deliberately stops before
 * any click happens, leaving the post-copy "Copied!" branch unpinned —
 * a refactor that flipped the truthy / falsy branches of the ternary
 * could regress the hover-overlay copy without the W1205 idle test ever
 * noticing. This test covers the missing branch.
 *
 * Observable behavior:
 *   1. While `phase === "playing"` the secondary toolbar mounts a button
 *      with `data-testid="share-seed-btn"` whose `data-tooltip` defaults
 *      to `"Share seed"` (the W1205 contract).
 *   2. Clicking it triggers `shareSeed`, which awaits
 *      `navigator.clipboard.writeText` and then calls
 *      `setShareStatus("copied")`. The dynamic ternary on `data-tooltip`
 *      flips to `"Copied!"` for the copied state.
 *   3. After the 1800ms hold (W883 covered the analog revert on the
 *      end-banner button) the `setShareStatus("idle")` setTimeout fires
 *      and `data-tooltip` reverts to `"Share seed"`. We optionally pin
 *      that revert here so a refactor that drops the trailing
 *      `setTimeout` on the in-toolbar button is caught too.
 *
 * Strategy mirrors W883 (`PlayPage.shareEndCopiedRevert.test.tsx`):
 *   - Install fake timers with `shouldAdvanceTime: true` BEFORE mount so
 *     any mount-phase microtasks aren't frozen on the virtual clock,
 *     while the 1800ms revert timer still registers against fake time.
 *   - Stub `navigator.clipboard.writeText` to resolve so the awaited
 *     write inside `shareSeed` settles and the `setShareStatus("copied")`
 *     branch runs before we re-read the attribute.
 *   - Use the same hoisted single-player fixture plugin pattern as the
 *     W1205 / W670 siblings.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — `vi.hoisted` evaluates before `vi.mock` factory
// bodies, mirroring the shareSeedBtnTooltip / seedCopy siblings.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-seed-btn-copied-tooltip-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share Seed Btn Copied Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for share-seed-btn data-tooltip copied-state pin (W1207).",
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
// the render side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

const FIXED_SEED = 42;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage share-seed-btn data-tooltip flips to 'Copied!' after a successful copy (W1207)", () => {
  it("post-click data-tooltip === 'Copied!' and reverts to 'Share seed' after the 1800ms hold", async () => {
    // Install fake timers BEFORE mount per the W883 / W725 pattern so any
    // mount-phase setTimeout / setInterval registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks (including the awaited clipboard writeText resolution
    // we trigger below) from deadlocking on the frozen clock.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub clipboard with a resolving spy. Same defineProperty dance as
    // the seedCopy / shareEndCopiedRevert siblings — jsdom marks
    // navigator.clipboard non-writable by default, so plain assignment
    // would throw.
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
    // Pre-condition: idle status renders the default "Share seed"
    // tooltip — the W1205 contract. Without this guardrail, a future
    // refactor that flipped the ternary's branches could leave the
    // post-click assertion vacuously true.
    expect(shareBtn.getAttribute("data-tooltip")).toBe("Share seed");

    // Click and let the awaited writeText resolve so the
    // `setShareStatus("copied")` branch runs before we re-read the
    // attribute.
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    // W1207 contract: after a successful copy, the dynamic ternary on
    // `data-tooltip` resolves to "Copied!" (the truthy branch). This
    // pin is the whole point of the test — it's the branch the W1205
    // idle-state sibling deliberately skipped.
    expect(shareBtn.getAttribute("data-tooltip")).toBe("Copied!");

    // Sanity: the click actually went through clipboard, not some other
    // path. Cheap guardrail so a future refactor that disables the
    // button or swallows the click won't make this test pass vacuously.
    expect(writeText).toHaveBeenCalledTimes(1);

    // Optional revert pin (W883 covered the analog revert on the
    // end-banner button). Advance past the 1800ms hold with a
    // comfortable margin so the trailing `setTimeout(setShareStatus,
    // 1800)` inside `shareSeed` fires and the tooltip reverts to its
    // idle copy. The 2000ms cushion absorbs any small clock-drift
    // introduced by `shouldAdvanceTime`.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(shareBtn.getAttribute("data-tooltip")).toBe("Share seed");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
