/**
 * Structural test for the PlayPage `.end-actions` wrapper *tag name* (W1456).
 *
 * Observable behavior:
 *   When the round reaches a terminal-win, PlayPage.tsx (~line 2720) renders
 *   the three primary end-banner CTAs ("New Game", "Replay", lobby back) as
 *   children of a `<div className="end-actions">`. PlayPage.css keys its
 *   flex/gap/wrap rules off `.end-actions` regardless of the host tag, but
 *   the React tree's structural contract is that the wrapper is a plain
 *   block-level `<div>` — not a `<section>`, not a `<nav>`, not a `<ul>` of
 *   `<li>` items. A refactor that swapped the host element (e.g. to `<nav>`
 *   for landmark semantics, or `<ul>` for list semantics) would silently
 *   alter the page's outline algorithm and the Tab order of assistive tech,
 *   while every existing end-actions test (W1080 structural — class + CTA
 *   testids; W1439 new-game `--big` modifier; replay/back-link sibling
 *   tests) continued to pass because none of them probe `tagName`.
 *
 *   Confirmed gap: an exhaustive grep across `web/src/pages/PlayPage*.test
 *   .tsx` for `end-actions.*tagName` / `tagName.*end-actions` returns zero
 *   hits. This test fills that gap by pinning the literal "DIV" tagName on
 *   the `.end-actions` wrapper after a winning terminal.
 *
 * Strategy mirrors W1080 (PlayPage.endActionsStructural.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal` to a
 *     positive-score payload after one dispatch — enough to drive PlayPage
 *     into the terminal-win branch that mounts the end-panel + end-actions.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip the setup
 *     screen and land directly in `phase === "playing"`.
 *   - Click the fixture's win button, locate `.end-actions` via
 *     querySelector, and assert `tagName === "DIV"` (uppercase — the DOM
 *     normalisation HTMLElement.tagName always emits for HTML documents).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-actions-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Actions Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-actions wrapper tagName test.",
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
// win-banner render fast and side-effect-free.
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

describe("PlayPage .end-actions wrapper tagName (W1456)", () => {
  it("renders the .end-actions wrapper as a <div> after a winning terminal", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the end-panel (and therefore .end-actions) is gated
    // behind `phase === "ended" && finalScore !== null` and is not mounted
    // yet. Asserting null here proves the upcoming non-null assertion
    // reflects the post-terminal render, not a stale initial render.
    expect(container.querySelector(".end-actions")).toBeNull();

    // One click drives the reducer (moves: 0 -> 1) so `isTerminal` returns
    // a winning payload and PlayPage transitions phase to "ended".
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the end-panel mounted (covers a regression that broke the
    // terminal-win branch entirely — without this the next assertion would
    // fail with a confusing "got null" instead of "got SECTION/NAV/etc.").
    expect(screen.getByTestId("end-panel")).toBeTruthy();

    const endActions = container.querySelector(".end-actions");
    expect(endActions).not.toBeNull();

    // Pin the literal tag name. HTMLElement.tagName always returns the
    // uppercase form in HTML documents, so a refactor to <section>, <nav>,
    // <ul>, or any other host element would emit a different string and
    // trip this assertion. Exact equality (not `toMatch`) so a wrapper
    // change isn't masked by a substring overlap.
    expect((endActions as HTMLElement).tagName).toBe("DIV");
  });
});

// Keeps this an unambiguous JSX module under strict tsconfigs that don't
// auto-inject the React runtime in test files.
void React;
