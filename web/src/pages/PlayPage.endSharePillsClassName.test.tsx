/**
 * Class-grouping test for the PlayPage end-share-row pills (W1237).
 *
 * Observable behavior:
 *   When the round reaches a terminal-win, PlayPage.tsx renders the
 *   share-pill cluster inside `.end-share-row`. Each clickable pill in
 *   that row carries the `play-share-pill` className — a bare class
 *   used by `.play-share-pill { ... }` rules in PlayPage.css to give
 *   the pills their shared button shape, padding, hover, and focus
 *   styles. The set of pills includes:
 *     - end-share-twitter        (tweet share)
 *     - share-seed-end-btn       (copy seed/link)
 *     - play-share-image-btn     (share image)
 *     - play-print-btn           (print)
 *     - play-save-replay         (save replay; win-only)
 *
 *   A rename or per-button drop of `play-share-pill` would silently
 *   detach the shared CSS while sibling tests (which key off testids
 *   and behavior) continued to pass. W1138's structural test pins the
 *   `.end-share-row` *wrapper*; W1233's note flagged that the inner
 *   buttons group together via the shared `play-share-pill` class.
 *   This test fills that gap with the minimum surface: drive the
 *   round to terminal-win, then assert each share-row button carries
 *   `play-share-pill` in its classList.
 *
 * Strategy mirrors W1138 (PlayPage.endShareRowStructural.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — drives PlayPage
 *     into the terminal-win branch where the end-panel and the full
 *     pill set (including play-save-replay) mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, then for each share-pill testid
 *     find the element and assert classList.contains("play-share-pill").
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-share-pills-classname-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Share Pills ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-share pills className test.",
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

describe("PlayPage end-share-row pills share play-share-pill class (W1237)", () => {
  it("each share-row button carries the play-share-pill class", async () => {
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

    // Drive the round to terminal-win so the end-panel and the full
    // pill set (including the win-only save-replay button) mount.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Pre-condition: end-panel must be mounted, otherwise the share
    // pills never rendered and the per-button assertions below would
    // be vacuous.
    expect(screen.getByTestId("end-panel")).toBeTruthy();

    const shareRowTestIds = [
      "end-share-twitter",
      "share-seed-end-btn",
      "play-share-image-btn",
      "play-print-btn",
      "play-save-replay",
    ] as const;

    for (const testId of shareRowTestIds) {
      const btn = screen.getByTestId(testId);
      expect(
        btn.classList.contains("play-share-pill"),
        `expected ${testId} to carry the play-share-pill class`,
      ).toBe(true);
    }
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
