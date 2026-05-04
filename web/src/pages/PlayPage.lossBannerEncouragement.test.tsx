/**
 * Unit test for PlayPage loss-banner headline + encouragement (W845).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2669-2683) renders, when `isWin` is false on a
 *   terminal round (i.e. score ≤ 0 — the "loss" path), a dedicated
 *   `loss-banner-headline` block in place of the win-banner headline:
 *
 *     <div data-testid="end-banner-loss" role="status" aria-live="polite">
 *       <h2 class="loss-banner-title">Game over</h2>
 *       <p data-testid="end-banner-loss-encouragement">{lossEncouragement}</p>
 *     </div>
 *
 *   `lossEncouragement` (PlayPage.tsx ~line 1398-1415) is a stable hash-pick
 *   of `${gameId}:${seed}` over an 8-line pool (e.g. "So close — give it
 *   another shot.", "Tough break! The next deal is yours.", ...). Sibling
 *   W792 (gameLoseTrack) pins the analytics breadcrumb that fires on a
 *   zero-score terminal but never asserts the loss-banner UI itself —
 *   testid presence, the "Game over" title, the encouragement paragraph,
 *   nor the `aria-live="polite"` semantics that screen-readers rely on.
 *
 *   A regression that dropped the loss-banner block (e.g. a refactor that
 *   collapsed `isWin ? winHeadline : lossHeadline` into a single shared
 *   headline), changed the title copy, removed the encouragement
 *   paragraph, or stripped the live-region attribute would silently
 *   degrade the loss UX without breaking any existing test.
 *
 * Strategy:
 *   Mirror W792's hoisted-plugin fixture — a reducer that flips into
 *   `isTerminal: { score: 0 }` on a single dispatched action — so PlayPage
 *   walks the loss branch (`isWin === false`, `isLoss === true`,
 *   `showLossBanner === true`). After the banner mounts, assert:
 *     1. The end-panel mounts with `data-win="false"` (loss-side render).
 *     2. `end-banner-loss` exists and carries `role="status"` +
 *        `aria-live="polite"` (screen-reader announcement contract).
 *     3. The `loss-banner-title` reads "Game over" (i18n key
 *        `hud.game_over` value pin).
 *     4. `end-banner-loss-encouragement` is one of the 8 known pool lines
 *        (whichever the stable `gameId:seed` hash picks), proving the
 *        useMemo is wired up and rendering a real string — not empty,
 *        undefined, or a fallback placeholder.
 *     5. The win-banner headline (`win-banner` testid) is NOT rendered —
 *        catches a regression that mounts both branches.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape (see W792
// for the win-vs-lose discriminator at PlayPage.tsx:1240, `term.score > 0`).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-encouragement-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Encouragement Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner UI assertion.",
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

// The 8 encouragement lines from PlayPage.tsx:1399-1408. We assert the
// rendered text is one of these — the exact pick is a stable hash of
// `${gameId}:${seed}` and we don't want this test coupled to that hash.
const ENCOURAGEMENT_POOL = [
  "So close — give it another shot.",
  "Tough break! The next deal is yours.",
  "Every loss sharpens the next win.",
  "Shuffle it off — you've got this.",
  "Not this time, but you're learning the deck.",
  "The cards turn — try again.",
  "One more hand could be the one.",
  "Don't fold now — replay and rally.",
];

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage loss-banner headline + encouragement (W845)", () => {
  it("renders the Game-over title, an aria-live encouragement line, and no win-banner on a zero-score terminal", async () => {
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

    // Drive the round into terminal-loss (score === 0).
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // (1) End-panel mounted with data-win="false" — confirms the
    // `isWin === false`, `isLoss === true` branch is the one driving render.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // (2) Loss-banner block exists with the screen-reader contract:
    // role="status" + aria-live="polite". Both attributes are load-bearing
    // for AT users — they're how the encouragement gets announced.
    const lossBanner = screen.getByTestId("end-banner-loss");
    expect(lossBanner).toBeTruthy();
    expect(lossBanner.getAttribute("role")).toBe("status");
    expect(lossBanner.getAttribute("aria-live")).toBe("polite");

    // (3) Title copy pin — i18n key `hud.game_over` resolves to "Game over".
    const title = lossBanner.querySelector(".loss-banner-title");
    expect(title).toBeTruthy();
    expect((title?.textContent ?? "").trim()).toBe("Game over");

    // (4) Encouragement is one of the eight pool lines — proves the
    // useMemo fired and rendered a real string, not "" or undefined. We
    // intentionally don't pin which line: the stable hash of
    // `${gameId}:${seed}` would couple this test to the hash function.
    const enc = screen.getByTestId("end-banner-loss-encouragement");
    expect(enc).toBeTruthy();
    expect(enc.tagName.toLowerCase()).toBe("p");
    const encText = (enc.textContent ?? "").trim();
    expect(encText.length).toBeGreaterThan(0);
    expect(ENCOURAGEMENT_POOL).toContain(encText);

    // (5) Win-banner headline is NOT mounted — guards against a regression
    // that renders both branches. `queryByTestId` returns null when absent.
    expect(screen.queryByTestId("win-banner")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
