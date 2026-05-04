/**
 * Unit test for the PlayPage end-banner "share to Twitter" button's
 * accessible name (W1216).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage renders a
 *   button with `data-testid="end-share-twitter"` (PlayPage.tsx ~line 2747).
 *   The button's visible content is an SVG icon plus the literal text
 *   "Tweet" — but the SVG is `aria-hidden`, so screen-reader users rely
 *   on the explicit `aria-label="Share on Twitter"` attribute on the
 *   button itself for an unambiguous accessible name.
 *
 *   The sibling W810 test pins the click -> window.open intent contract,
 *   but no test pins the accessible-name attribute. A regression that
 *   dropped or renamed `aria-label` (for instance, while refactoring the
 *   icon into a child component) would silently degrade screen-reader
 *   UX while every behavioral test continued to pass.
 *
 * Strategy mirrors the W810 fixture pattern:
 *   - A hoisted fixture plugin whose reducer flips `isTerminal` to a
 *     positive-score payload after one dispatch drives PlayPage into
 *     the terminal-win branch with `?quickstart=1` skipping setup.
 *   - After the win, query the Tweet button by testid and assert
 *     `aria-label="Share on Twitter"` exactly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-share-twitter-attr-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Share Twitter Attr Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-share-twitter aria-label test.",
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

describe("PlayPage end-banner Twitter share button aria-label (W1216)", () => {
  it("exposes 'Share on Twitter' as the accessible name on end-share-twitter", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win so the share row mounts.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const tweetBtn = screen.getByTestId("end-share-twitter");
    // The SVG icon is aria-hidden, so the button itself must carry
    // the explicit screen-reader label.
    expect(tweetBtn.getAttribute("aria-label")).toBe("Share on Twitter");
  });
});

void React;
