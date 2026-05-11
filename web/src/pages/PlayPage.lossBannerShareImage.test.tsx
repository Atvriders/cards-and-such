/**
 * Unit test for the PlayPage end-banner "Save image" button on the LOSS
 * path (W878).
 *
 * Observable behavior:
 *   The end-share-row (PlayPage.tsx ~line 2746) renders unconditionally
 *   for any terminal phase, and the `play-share-image-btn` button inside
 *   it (line 2771) is NOT gated on `isWin` — only the `play-save-replay`
 *   sibling carries the win-only guard (W866 pins that). The
 *   `shareImage` callback (PlayPage.tsx ~line 1451) uses
 *   `finalScore ?? 0`, so a zero-score loss still produces a valid SVG
 *   share card. After it hands the SVG to `downloadSvg`, it fires
 *   `track("play.share_image", { gameId })`.
 *
 *   W796 pinned the WIN-path share-image click: the analytics breadcrumb
 *   fires AND a Blob/anchor click drives the download. No test currently
 *   pins the LOSS-path equivalent. A regression that wrapped the
 *   share-image button in an `isWin` gate, dropped the click handler,
 *   stopped invoking `downloadSvg`, or stopped emitting
 *   `play.share_image` would silently break the share-card path for
 *   defeats while every existing share-row test continued to pass —
 *   the share-row itself stays mounted because its other buttons (Tweet,
 *   Copy link, Print) are exercised by W871 / earlier tests on the loss
 *   banner.
 *
 * Strategy mirrors W796's win-banner click test, but with W845's
 *   `isTerminal: { score: 0 }` loss fixture so PlayPage walks the
 *   `isLoss === true` branch instead of the win branch. After clicking
 *   `play-share-image-btn` on the loss banner, observe that:
 *     1. Exactly one `play.share_image` event with `{ gameId }` lands in
 *        the analytics ring (the breadcrumb contract).
 *     2. The `downloadSvg` side-effect runs — `URL.createObjectURL` is
 *        called with a Blob and the synthetic anchor's `click()` fires
 *        (the actual download path).
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
  const TEST_GAME_ID = "loss-banner-share-image-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Share Image Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for loss-banner share-image analytics + download test.",
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

describe("PlayPage loss-banner share-image button (W878)", () => {
  it("clicking play-share-image-btn on the loss banner records exactly one play.share_image event AND triggers the SVG download", async () => {
    // jsdom doesn't implement URL.createObjectURL/revokeObjectURL — stub
    // them so the `downloadSvg` call inside `shareImage` runs without
    // throwing and the subsequent `track("play.share_image", ...)` line
    // is reached. Capture the createObjectURL spy so we can also assert
    // the download path actually executed (a Blob was wrapped + a URL
    // returned), not just that the analytics breadcrumb fired.
    const createObjUrlSpy = vi.fn(
      (_blob: Blob) => "blob:loss-share-image-mock",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = createObjUrlSpy;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = vi.fn();
    // The anchor click would otherwise try to navigate to the blob URL.
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const { default: PlayPage } = await import("./PlayPage.js");
    const { getEvents, clearEvents } = await import(
      "../platform/analytics.js"
    );

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
    // W796 already covers).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-on-loss assertion: the Save image button must be
    // mounted on the loss path. (Per W866/W871, the share-row is shared
    // between win and loss; only `play-save-replay` is win-gated.)
    const shareBtn = screen.getByTestId("play-share-image-btn");
    expect(shareBtn).toBeTruthy();

    // Clear the ring right before the click so the assertion below is
    // unambiguously about the share-image handler — not the prior
    // app.boot / route.change / game.start / game.lose breadcrumbs from
    // earlier in this same test.
    clearEvents();
    createObjUrlSpy.mockClear();
    clickSpy.mockClear();

    act(() => {
      fireEvent.click(shareBtn);
    });

    // 1. Analytics contract: exactly one play.share_image event with the
    //    fixture's gameId. Filtered to that name so any future unrelated
    //    breadcrumb the share-image handler grows alongside this one
    //    doesn't false-positive a regression here.
    const shareEvts = getEvents().filter(
      (e) => e.name === "play.share_image",
    );
    expect(shareEvts.length).toBe(1);
    expect(shareEvts[0]?.props).toEqual({
      gameId: hoisted.TEST_GAME_ID,
    });

    // 2. Download contract: the SVG was wrapped in a Blob and a synthetic
    //    anchor's click() fired. Pins the actual download side-effect on
    //    the loss path, not just the analytics breadcrumb.
    expect(createObjUrlSpy).toHaveBeenCalledTimes(1);
    expect(createObjUrlSpy.mock.calls[0]![0]).toBeInstanceOf(Blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
