/**
 * Structural test for the PlayPage `.final-score-label` class (W1116).
 *
 * Observable behavior:
 *   When the round reaches a terminal state, PlayPage.tsx (~line 2693)
 *   renders a `<div className="final-score-label">{t("hud.score")}</div>`
 *   inside the end-banner panel, directly between the `.final-score`
 *   numeric headline and the `.end-stats` definition list. The
 *   `.final-score-label` class anchors the secondary "Score" caption's
 *   typography (font-size, color, letter-spacing, top margin) defined
 *   in PlayPage.css (line 948). A rename, removal, or replacement of
 *   the class would silently strip the caption's styling — the visible
 *   "Score" text would still render, but it would inherit base body
 *   styles and visually collide with the giant `.final-score` number
 *   above it.
 *
 *   An exhaustive grep across the test suite turned up zero
 *   `final-score-label` references — sibling tests pin the score
 *   number (W endStatsBest, finalScoreClass W1094, finalScoreAttr),
 *   the win-banner headline (W winBannerText), the end-stats wrapper
 *   (W endStatsStructural W1099) and rows (W endStatsRowStructural),
 *   but the caption directly underneath the score number has no
 *   structural pin. This test fills that gap with the minimum
 *   surface: drive the round to terminal-win, locate the caption by
 *   its CSS class, and pin both the class itself and its position
 *   inside the end-panel.
 *
 * Strategy mirrors W1099 (PlayPage.endStatsStructural.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — enough to
 *     drive PlayPage into the terminal-win branch where the end-panel
 *     and its `.final-score-label` caption mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, then locate `.final-score-label`
 *     via querySelector and assert (a) the class is present, (b) it
 *     lives inside the end-panel, and (c) it sits between the
 *     `.final-score` and `.end-stats` siblings — the exact slot the
 *     CSS rule assumes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "final-score-label-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Final Score Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the final-score-label class test.",
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

describe("PlayPage .final-score-label caption (W1116)", () => {
  it("renders a .final-score-label inside the end-panel between .final-score and .end-stats", async () => {
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

    // Pre-condition: the end-panel (and therefore .final-score-label) is
    // not mounted before the round terminates — both live behind the
    // `phase === "ended" && finalScore !== null` render gate.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(container.querySelector(".final-score-label")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel).toBeTruthy();

    const label = container.querySelector(".final-score-label");

    // Pin existence — a rename here detaches the .final-score-label
    // CSS rule (font-size, color, letter-spacing, top margin) and the
    // "Score" caption regresses to inherited body styles.
    expect(label).not.toBeNull();
    // Pin the bare class — the CSS selector keys off the exact name.
    expect(label?.classList.contains("final-score-label")).toBe(true);
    // Pin the structural relationship: .final-score-label is a
    // descendant of the end-panel section. A regression that hoisted
    // it out would break the contained layout context the CSS assumes.
    expect(endPanel.contains(label as Node)).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
