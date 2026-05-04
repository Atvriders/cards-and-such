/**
 * Unit test for the PlayPage `share-seed-btn` `title` attribute in the
 * COPIED state (W1211).
 *
 * Sibling pins covering this dynamic toolbar button:
 *   - W1191 (`PlayPage.shareSeedBtnTitle.test.tsx`) — idle `title="Share
 *     seed"` branch.
 *   - W1197 (`PlayPage.shareSeedBtnAria.test.tsx`) — static
 *     `aria-label="Share seed"` (which is NOT shareStatus-bound).
 *   - W1205 (`PlayPage.shareSeedBtnTooltip.test.tsx`) — idle
 *     `data-tooltip="Share seed"` branch.
 *   - W1207 (`PlayPage.shareSeedBtnCopiedTooltip.test.tsx`) — copied
 *     `data-tooltip="Copied!"` branch.
 *
 * What's still uncovered: the `title` attribute is the SECOND
 * shareStatus-bound attribute on this button (PlayPage.tsx ~line 2090):
 *   `title={shareStatus === "copied" ? "Seed URL copied!" : "Share seed"}`
 * The W1191 sibling deliberately stops before any click happens, leaving
 * the post-copy "Seed URL copied!" branch unpinned — a refactor that
 * flipped the truthy / falsy branches of THIS ternary (independent from
 * the data-tooltip ternary right next to it) could regress the native
 * browser tooltip / accessibility hint without W1191 ever noticing.
 *
 * (Note: the `aria-label` on this button is a static string literal, not
 * bound to shareStatus, so there is no copied-state branch to pin for
 * aria-label — only the `title` attribute needs the post-copy companion.)
 *
 * Observable behavior:
 *   1. While `phase === "playing"` the secondary toolbar mounts a button
 *      with `data-testid="share-seed-btn"` whose `title` defaults to
 *      `"Share seed"` (the W1191 contract).
 *   2. Clicking it triggers `shareSeed`, which awaits
 *      `navigator.clipboard.writeText` and then calls
 *      `setShareStatus("copied")`. The dynamic ternary on `title` flips
 *      to `"Seed URL copied!"` for the copied state.
 *   3. After the 1800ms hold the trailing `setTimeout` reverts
 *      `shareStatus` back to `"idle"` and `title` returns to
 *      `"Share seed"`. We pin that revert here too so a refactor that
 *      drops the trailing `setTimeout` on the in-toolbar button is caught
 *      symmetrically with W1207's revert pin.
 *
 * Strategy mirrors W1207 (`PlayPage.shareSeedBtnCopiedTooltip.test.tsx`)
 * exactly — same hoisted single-player fixture, same fake-timer install
 * with `shouldAdvanceTime: true`, same `Object.defineProperty` clipboard
 * stub. The ONLY differences are which attribute we read and what string
 * we expect.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — `vi.hoisted` evaluates before `vi.mock` factory
// bodies, mirroring the W1207 / W1205 / seedCopy siblings.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-seed-btn-copied-aria-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share Seed Btn Copied Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for share-seed-btn title copied-state pin (W1211).",
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

describe("PlayPage share-seed-btn title flips to 'Seed URL copied!' after a successful copy (W1211)", () => {
  it("post-click title === 'Seed URL copied!' and reverts to 'Share seed' after the 1800ms hold", async () => {
    // Install fake timers BEFORE mount per the W883 / W1207 pattern so
    // any mount-phase setTimeout / setInterval registers against the
    // virtual clock from the start. `shouldAdvanceTime: true` keeps
    // mount-phase microtasks (including the awaited clipboard writeText
    // resolution we trigger below) from deadlocking on the frozen clock.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub clipboard with a resolving spy. Same defineProperty dance as
    // the W1207 / seedCopy siblings — jsdom marks navigator.clipboard
    // non-writable by default, so plain assignment would throw.
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
    // Pre-condition: idle status renders the default "Share seed" title
    // — the W1191 contract. Without this guardrail, a future refactor
    // that flipped the ternary's branches could leave the post-click
    // assertion vacuously true.
    expect(shareBtn.getAttribute("title")).toBe("Share seed");

    // Click and let the awaited writeText resolve so the
    // `setShareStatus("copied")` branch runs before we re-read the
    // attribute.
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    // W1211 contract: after a successful copy, the dynamic ternary on
    // `title` resolves to "Seed URL copied!" (the truthy branch). This
    // pin is the whole point of the test — it's the branch the W1191
    // idle-state sibling deliberately skipped.
    expect(shareBtn.getAttribute("title")).toBe("Seed URL copied!");

    // Sanity: the click actually went through clipboard, not some other
    // path. Cheap guardrail so a future refactor that disables the
    // button or swallows the click won't make this test pass vacuously.
    expect(writeText).toHaveBeenCalledTimes(1);

    // Symmetric revert pin (W1207 covers the analog revert on
    // data-tooltip). Advance past the 1800ms hold with a comfortable
    // margin so the trailing `setTimeout(setShareStatus, 1800)` inside
    // `shareSeed` fires and the title reverts to its idle copy. The
    // 2000ms cushion absorbs any small clock-drift introduced by
    // `shouldAdvanceTime`.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(shareBtn.getAttribute("title")).toBe("Share seed");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
