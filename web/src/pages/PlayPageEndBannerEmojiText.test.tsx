/**
 * Unit test for the PlayPage win-banner emoji span TEXT CONTENT (W1706).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~lines
 *   2665 and 2667) renders TWO decorative emoji spans flanking the title:
 *     <span className="win-banner-emoji" aria-hidden="true">🎉</span>
 *     <h2 className="win-banner-title">You won!</h2>
 *     <span className="win-banner-emoji" aria-hidden="true">🎉</span>
 *
 *   Sibling test PlayPageEndBannerEmojiClass.test.tsx (W1350) pins the
 *   className and the `aria-hidden="true"` attribute on each span — but
 *   it does NOT pin the literal text content. A regression that swapped
 *   the 🎉 glyph for an empty span, a different emoji (🥳, 🏆, ✨), or
 *   text like "Win!" would still satisfy the className/aria-hidden test
 *   while silently breaking the celebratory styling intent. This test
 *   pins the literal U+1F389 PARTY POPPER glyph as the span's textContent
 *   to guard against that drift.
 *
 * Strategy:
 *   Mirror the hoisted fixture pattern from W1350 verbatim: a one-action
 *   plugin whose reducer increments `moves` and whose `isTerminal` returns
 *   a winning payload after a single dispatch. Install fake timers with
 *   `shouldAdvanceTime: true` BEFORE mount per the W639/W647 pattern so
 *   the 1Hz elapsed-counter effect arms cleanly. Use `?quickstart=1` so
 *   PlayPage skips the setup screen. One click drives PlayPage into
 *   terminal-win; we then locate the emoji spans inside the win-banner
 *   wrapper and assert each span's textContent is exactly "🎉".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; `isTerminal` returns a winning
// payload once `moves >= 1`, so a single dispatch from the fixture button
// drives PlayPage into the terminal-win branch and renders the win banner
// — the only branch which carries the `win-banner-emoji` spans we assert on.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-banner-emoji-text-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Banner Emoji Text Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner emoji textContent test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 1 } : null,
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

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage win-banner emoji span text content (W1706)", () => {
  it('renders the literal 🎉 (U+1F389) glyph inside each `.win-banner-emoji` span', async () => {
    // Install fake timers BEFORE mount per W639/W647 pattern so the 1Hz
    // `setInterval` that drives `elapsed` registers against the virtual
    // clock from the start.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: win-banner is not mounted until the game ends.
    expect(screen.queryByTestId("win-banner")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Scope the query to the win-banner wrapper so we only count the
    // headline emojis (defensive — should always be 2).
    const banner = screen.getByTestId("win-banner");
    const emojis = banner.querySelectorAll(".win-banner-emoji");
    expect(emojis.length).toBe(2);

    // The actual assertion under test: each emoji span's textContent is
    // EXACTLY the U+1F389 PARTY POPPER glyph "🎉" — no whitespace, no
    // wrapping element, no fallback text. Strict equality (not `.toContain`)
    // so substituting "🎉🎊" or surrounding whitespace would also fail.
    emojis.forEach((emoji) => {
      expect(emoji.textContent).toBe("🎉");
    });
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
