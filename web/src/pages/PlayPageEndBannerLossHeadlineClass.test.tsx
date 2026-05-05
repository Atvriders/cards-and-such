/**
 * Unit test for the PlayPage loss-banner headline wrapper className (W1720).
 *
 * Observable behavior:
 *   PlayPage.tsx (~lines 2670-2683) renders the loss-banner headline as a
 *   `<div>` wrapper with `data-testid="end-banner-loss"` that ALSO carries
 *   a literal `loss-banner-headline` className:
 *
 *     <div
 *       className="loss-banner-headline"
 *       data-testid="end-banner-loss"
 *       role="status"
 *       aria-live="polite"
 *     >
 *       <h2 className="loss-banner-title">…</h2>
 *       <p className="loss-banner-encouragement" …>…</p>
 *     </div>
 *
 *   Sibling tests pin:
 *     - `<h2 class="loss-banner-title">` tag (W1691 — PlayPageEndBannerLossTitleTag).
 *     - `<p class="loss-banner-encouragement">` className (W1713 —
 *       PlayPageEndBannerLossEncClass).
 *     - `end-banner-loss` carrying `role="status"` + `aria-live="polite"`
 *       (W845 — PlayPage.lossBannerEncouragement).
 *
 *   No existing test asserts the literal `loss-banner-headline` className
 *   on that wrapper `<div>`. That class is the exact CSS hook PlayPage.css
 *   uses to stack/space/style the H2 + encouragement paragraph as a unit
 *   directly above the final score — a regression that renamed it (e.g.
 *   to `loss-banner__headline` during a BEM refactor) or dropped it
 *   entirely would silently strip the headline layout while every
 *   existing role/aria/testid/child-class assertion still passed.
 *
 * Strategy:
 *   Mirror the W845/W1691/W1713 hoisted-fixture pattern exactly —
 *   single-dispatch reducer that flips into `isTerminal: { score: 0 }`
 *   (the canonical losing-terminal shape, see PlayPage.tsx isWin
 *   discriminator `term.score > 0`), registry mock substituting the
 *   fixture, Confetti null-stub. After the loss banner mounts, locate
 *   the `end-banner-loss` wrapper and assert its className is exactly
 *   "loss-banner-headline". One attribute, one render — distinct from
 *   every adjacent loss-banner pin.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape that drives
// PlayPage straight into the `showLossBanner=true` branch which mounts the
// loss-banner-headline wrapper <div>.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-headline-class-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Headline Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner headline className.",
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

describe("PlayPage loss banner: .loss-banner-headline wrapper <div> className (W1720)", () => {
  it("renders the headline wrapper with className === 'loss-banner-headline'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0). One click is enough
    // — the fixture's isTerminal flips to `{ score: 0 }` on the first
    // dispatched LOSE, mounting the loss-banner-headline wrapper.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: end-panel mounted in the loss branch (data-win="false"). Without
    // this guard, the className check could pass for the wrong reason — e.g.
    // some unrelated element happens to share the className elsewhere.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Locate the loss-banner headline wrapper by testid, then assert its
    // exact-match className. Sibling tests pin role/aria-live, the H2 title
    // tag, and the encouragement paragraph className/tag — this is the
    // CSS-hook contract that keeps the headline block laid out as a unit.
    const headline = screen.getByTestId("end-banner-loss");

    // Confirm it really is the wrapper <div> (not the H2 or P inside).
    expect(headline.tagName.toLowerCase()).toBe("div");

    // The contract pin: exact-match className (not `.contains`) so a rename
    // — e.g. `loss-banner__headline` — would still trip this assertion.
    expect(headline.className).toBe("loss-banner-headline");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
