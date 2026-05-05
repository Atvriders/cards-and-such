/**
 * Unit test for the PlayPage loss-banner encouragement <p> className (W1713).
 *
 * Observable behavior:
 *   PlayPage.tsx (~lines 2677-2682) renders the encouragement paragraph
 *   inside the loss-banner-headline as:
 *
 *     <p
 *       className="loss-banner-encouragement"
 *       data-testid="end-banner-loss-encouragement"
 *     >
 *       {lossEncouragement}
 *     </p>
 *
 *   Sibling tests pin:
 *     - The <h2 class="loss-banner-title"> tag (W1691 — PlayPageEndBannerLossTitleTag).
 *     - The encouragement paragraph's data-testid presence, tagName === "p",
 *       and that the rendered text is one of the 8 known pool lines (W845
 *       — PlayPage.lossBannerEncouragement).
 *
 *   No existing test asserts the literal `loss-banner-encouragement`
 *   className on that paragraph. That class is the exact CSS hook
 *   PlayPage.css uses to size/space/style the encouragement line directly
 *   under the "Game over" title — a regression that renamed it (e.g. to
 *   `loss-banner__encouragement` during a BEM refactor) or dropped it
 *   entirely would silently strip the styling while every existing
 *   text/testid/tagName assertion still passed.
 *
 * Strategy:
 *   Mirror the W845/W1691 hoisted-fixture pattern exactly — single-dispatch
 *   reducer that flips into `isTerminal: { score: 0 }` (the canonical
 *   losing-terminal shape, see PlayPage.tsx isWin discriminator
 *   `term.score > 0`), registry mock substituting the fixture, Confetti
 *   null-stub. After the loss banner mounts, scope the query to the
 *   `end-banner-loss` testid wrapper, locate the encouragement paragraph
 *   by its testid, and assert its className is exactly
 *   "loss-banner-encouragement". One attribute, one render — distinct from
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
// loss-banner-headline (and its <p class="loss-banner-encouragement">).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-enc-class-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Enc Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner encouragement className.",
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

describe("PlayPage loss banner: .loss-banner-encouragement <p> className (W1713)", () => {
  it("renders the encouragement paragraph with className === 'loss-banner-encouragement'", async () => {
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
    // dispatched LOSE, mounting the loss banner and its encouragement <p>.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: end-panel mounted in the loss branch (data-win="false"). Without
    // this guard, the className check could pass for the wrong reason — e.g.
    // some unrelated element happens to share the className elsewhere.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Scope the query to the loss-banner wrapper so we only inspect the
    // headline encouragement paragraph and not any unrelated markup.
    const lossBanner = screen.getByTestId("end-banner-loss");
    const enc = lossBanner.querySelector(
      '[data-testid="end-banner-loss-encouragement"]',
    );
    expect(enc).toBeTruthy();

    // The contract pin: exact-match className (not `.contains`) so a rename
    // — e.g. `loss-banner__encouragement` — would still trip this assertion.
    // Sibling tests pin the testid, tagName, and text content; this is the
    // CSS-hook contract that keeps the loss-modal's encouragement styled.
    expect((enc as HTMLElement).className).toBe("loss-banner-encouragement");
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
