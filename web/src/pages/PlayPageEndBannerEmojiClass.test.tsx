/**
 * Unit test for the PlayPage win-banner emoji span className (W1350).
 *
 * Observable behavior:
 *   When the game reaches a winning terminal state, PlayPage.tsx (~lines
 *   2665 and 2667) renders the win-banner headline with TWO decorative
 *   emoji spans flanking the `<h2>You won!</h2>` title:
 *     <span className="win-banner-emoji" aria-hidden="true">🎉</span>
 *     <h2 className="win-banner-title">You won!</h2>
 *     <span className="win-banner-emoji" aria-hidden="true">🎉</span>
 *   Sibling tests cover the wrapper className `win-banner-headline`
 *   (W1242), the heading className `win-banner-title` (W1292), and the
 *   `final-score--win` modifier (W1336) — but no test asserts the
 *   `win-banner-emoji` class on the flanking spans, even though that
 *   class is the exact CSS hook PlayPage.css uses to drive the celebratory
 *   animation/sizing of the emoji 🎉. A regression that dropped or
 *   renamed the className would silently kill the celebratory styling
 *   while every adjacent functional test (text, score, buttons) still
 *   passed.
 *
 * Strategy:
 *   Mirror the hoisted fixture pattern from W1242 (PlayPageEndBannerClassName
 *   .test.tsx): a one-action plugin whose reducer increments `moves` and
 *   whose `isTerminal` returns a winning payload after a single dispatch.
 *   Install fake timers with `shouldAdvanceTime: true` BEFORE mount per the
 *   W639/W647 pattern so the 1Hz elapsed-counter effect arms cleanly. Use
 *   `?quickstart=1` so PlayPage skips the setup screen and mounts the
 *   fixture's dispatch button immediately. One click drives PlayPage into
 *   terminal-win; we then locate the emoji spans inside the win-banner
 *   wrapper and assert they expose the literal `win-banner-emoji` class
 *   AND the `aria-hidden="true"` attribute (so screen readers don't
 *   double-announce the headline).
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
  const TEST_GAME_ID = "end-banner-emoji-class-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Banner Emoji Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner emoji className test.",
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

describe("PlayPage win-banner emoji span className (W1350)", () => {
  it('renders two `.win-banner-emoji` spans (aria-hidden) flanking the win-banner title', async () => {
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

    // Pre-condition: the win-banner wrapper (and therefore its emoji
    // spans) are NOT mounted before the game ends — they live inside the
    // `phase === "ended" && isWin` branch of the JSX.
    expect(screen.queryByTestId("win-banner")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Scope the query to the win-banner wrapper so we only count the
    // headline emojis and don't accidentally pick up unrelated
    // `.win-banner-emoji` markup elsewhere on the page (defensive: there
    // currently aren't any others, but scoping makes the assertion
    // robust against future additions).
    const banner = screen.getByTestId("win-banner");
    const emojis = banner.querySelectorAll(".win-banner-emoji");

    // Pin the count at exactly 2 — the JSX flanks the `<h2>` with one
    // span on each side. A regression that dropped one span (or added a
    // third) would surface here.
    expect(emojis.length).toBe(2);

    // Pin each emoji span's class + `aria-hidden="true"`. Exact-match
    // className (not `.contains`) so a rename — e.g. `win-banner__emoji`
    // — would still trip this assertion. `aria-hidden` matters because
    // the headline text "You won!" already lives in the `<h2>`, and
    // double-announcing the 🎉 glyph through assistive tech would be
    // confusing.
    emojis.forEach((emoji) => {
      expect(emoji.className).toBe("win-banner-emoji");
      expect(emoji.getAttribute("aria-hidden")).toBe("true");
    });
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
