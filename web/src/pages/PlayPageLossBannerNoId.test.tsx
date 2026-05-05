/**
 * Pinpoint test for the PlayPage loss-banner headline `id` attribute
 * absence (W2059).
 *
 * Observable behavior:
 *   When the round terminates with a non-positive score, PlayPage.tsx
 *   (~lines 2670-2684) renders the losing headline as
 *     <div
 *       className="loss-banner-headline"
 *       data-testid="end-banner-loss"
 *       role="status"
 *       aria-live="polite"
 *     >
 *       <h2 className="loss-banner-title">…</h2>
 *       <p className="loss-banner-encouragement" …>…</p>
 *     </div>
 *   inside the `[data-testid="end-panel"]` section. The wrapper is
 *   located in tests, CSS, and DOM queries via the
 *   `.loss-banner-headline` className and the
 *   `data-testid="end-banner-loss"` attribute — never via a DOM `id`.
 *   Adding an `id` would change CSS targeting surface,
 *   `document.getElementById` discoverability, and hash-link / aria
 *   anchor semantics; the loss-banner headline `<div>` is currently not
 *   intended to act as such an anchor.
 *
 *   Existing tests cover the wrapper from many angles:
 *     • headline className "loss-banner-headline"
 *       (W1720 — PlayPageEndBannerLossHeadlineClass)
 *     • inner <h2> tag (W1691 — PlayPageEndBannerLossTitleTag)
 *     • encouragement <p> className
 *       (W1713 — PlayPageEndBannerLossEncClass)
 *     • role="status" + aria-live="polite"
 *       (W845 — PlayPage.lossBannerEncouragement)
 *
 *   None pin the `id` attribute on the loss-banner wrapper itself. That
 *   gap means an accidental `id="end-banner-loss"` (or a stylesheet-driven
 *   id graft) could land silently. This test fills the gap with the
 *   minimum surface: render → drive a loss → grab
 *   `[data-testid="end-banner-loss"]` and assert
 *   `banner.hasAttribute("id") === false`. `hasAttribute` returns true
 *   for any string value (including ""), so this fails loudly the
 *   moment the wrapper grows any kind of DOM id.
 *
 * Strategy mirrors W2042 (PlayPageWinBannerNoId.test.tsx) and W1720
 * (PlayPageEndBannerLossHeadlineClass.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a `{ score: 0 }` payload (the canonical losing-terminal shape;
 *     PlayPage's isWin discriminator is `term.score > 0`) after one
 *     dispatched LOSE — drives PlayPage into the terminal-loss branch
 *     where the end-panel and its `.loss-banner-headline` `<div>` mount.
 *   - Registry mock substitutes the fixture so the real catalogue
 *     doesn't load.
 *   - Confetti null-stub avoids canvas APIs jsdom doesn't ship.
 *   - Click `start-game` to leave setup, then click the fixture's lose
 *     button, locate the wrapper via `data-testid="end-banner-loss"`,
 *     and assert `hasAttribute("id")` is false on that node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape that drives
// PlayPage straight into the `showLossBanner=true` branch which mounts the
// loss-banner-headline wrapper <div> with data-testid="end-banner-loss".
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-no-id-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner No Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the loss-banner <div> id-attribute absence test.",
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
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss-banner <div> id-attribute absence (W2059)", () => {
  it("renders the loss-banner headline with no id attribute", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the wrapper is NOT mounted before the round
    // terminates — it lives behind the
    // `phase === "ended" && finalScore !== null` render gate plus the
    // !isWin branch.
    expect(screen.queryByTestId("end-banner-loss")).toBeNull();

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0). One click is
    // enough — the fixture's isTerminal flips to `{ score: 0 }` on the
    // first dispatched LOSE, mounting the loss-banner-headline wrapper.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: end-panel mounted in the loss branch (data-win="false").
    // Without this guard, the id-absence check could pass for the wrong
    // reason (e.g. the wrapper failed to mount at all).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Locate via data-testid (the contract pinned elsewhere) so this
    // test isolates exactly the loss-banner headline <div> wrapper node.
    const banner = screen.getByTestId("end-banner-loss");
    expect(banner).toBeTruthy();
    // Sanity: the located node really is the headline <div> we mean to pin.
    expect(banner.tagName).toBe("DIV");

    // Pin "no id". `hasAttribute("id")` returns true for any string
    // value (including ""), so this fails loudly the moment the
    // wrapper grows any kind of DOM id.
    expect(banner.hasAttribute("id")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
