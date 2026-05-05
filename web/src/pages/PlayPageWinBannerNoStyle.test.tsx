/**
 * Pinpoint test for the PlayPage win-banner headline `style` attribute
 * absence (W2120).
 *
 * Observable behavior:
 *   When the round terminates with a positive score, PlayPage.tsx
 *   (~line 2664) renders the winning headline as
 *     `<div className="win-banner-headline" data-testid="win-banner">…</div>`
 *   inside the `[data-testid="end-panel"]` section. Visual layout for
 *   this wrapper is delegated entirely to the stylesheet via the
 *   `.win-banner-headline` className — no inline `style` attribute is
 *   emitted by the component. Adding an inline style would override
 *   the cascade, defeat theming, and create per-instance specificity
 *   that bypasses the design system.
 *
 *   Existing tests cover the wrapper from many angles:
 *     • headline text "You won!" (W801, winBannerText)
 *     • className "win-banner-headline" (EndBannerClassName)
 *     • emoji content / class (EndBannerEmojiText, EndBannerEmojiClass)
 *     • the inner <h2> tag (EndBannerWinTitleTag)
 *     • dialog role / aria on the parent end-panel
 *     • `id` attribute absence (W2042, PlayPageWinBannerNoId)
 *
 *   None pin the `style` attribute on the win-banner wrapper itself.
 *   That gap means an accidental inline-style graft (e.g. an ad-hoc
 *   `style={{ color: "..." }}`) could land silently and override the
 *   stylesheet contract. This test fills the gap with the minimum
 *   surface: render → drive a win → grab `[data-testid="win-banner"]`
 *   and assert `banner.hasAttribute("style") === false`. `hasAttribute`
 *   returns true for any string value (including ""), so this fails
 *   loudly the moment the wrapper grows any kind of inline style
 *   attribute.
 *
 * Strategy mirrors W2042 (PlayPageWinBannerNoId.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — drives PlayPage
 *     into the terminal-win branch where the end-panel and its
 *     `.win-banner-headline` `<div>` mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, locate the wrapper via
 *     `data-testid="win-banner"`, and assert `hasAttribute("style")`
 *     is false on that node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-no-style-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner No Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the win-banner <div> style-attribute absence test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 42 } : null,
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
  vi.restoreAllMocks();
});

describe("PlayPage win-banner <div> style-attribute absence (W2120)", () => {
  it("renders the win-banner headline with no inline style attribute", async () => {
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

    // Pre-condition: the wrapper is NOT mounted before the round
    // terminates — it lives behind the
    // `phase === "ended" && finalScore !== null` render gate plus the
    // `isWin` branch.
    expect(screen.queryByTestId("win-banner")).toBeNull();

    // Drive the round to terminal-win. One click increments moves
    // (0 -> 1), `isTerminal` returns a winning payload, and the
    // end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Locate via data-testid (the contract pinned elsewhere) so this
    // test isolates exactly the win-banner headline <div> wrapper node.
    const banner = screen.getByTestId("win-banner");
    expect(banner).toBeTruthy();
    // Sanity: the located node really is the headline <div> we mean to pin.
    expect(banner.tagName).toBe("DIV");

    // Pin "no inline style". `hasAttribute("style")` returns true for
    // any string value (including ""), so this fails loudly the moment
    // the wrapper grows any kind of inline style attribute.
    expect(banner.hasAttribute("style") === false).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
