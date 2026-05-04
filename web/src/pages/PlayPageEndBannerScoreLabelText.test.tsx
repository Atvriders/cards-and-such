/**
 * Structural test for the PlayPage `.final-score-label` *text content*
 * (W1475).
 *
 * Observable behavior:
 *   When the round reaches a terminal state, PlayPage.tsx (~line 2693)
 *   renders a `<div className="final-score-label">{t("hud.score")}</div>`
 *   directly beneath the `.final-score` numeric headline. With the
 *   default English `i18n` registry (web/src/platform/i18n.ts), the
 *   `"hud.score"` key resolves to the literal string `"Score"` — the
 *   visible caption that labels the giant numeric score above it.
 *
 *   Sibling tests already pin the surrounding scaffolding:
 *     - W1116 (PlayPage.endStatsClass) pins the `.final-score-label`
 *       class itself and its position inside the end-panel.
 *     - W1414 (PlayPageEndStatsLabelTag) pins the `<div>` tagName.
 *     - W1094/finalScoreClass pins the `.final-score` numeric headline.
 *   But none of them assert what TEXT actually appears inside the
 *   caption — a regression that swapped `{t("hud.score")}` for a wrong
 *   key (e.g. `t("hud.moves")` -> "Moves", or an empty string from a
 *   typo'd key) would leave the class, tagName, and surrounding
 *   structure intact while silently breaking the user-visible label.
 *
 *   An exhaustive grep across PlayPage*.test.tsx for combinations of
 *   `final-score-label` + `textContent` / `Score` returns only the
 *   doc-comment references in W1116/W1414 — no test asserts on the
 *   caption's text. This test fills that gap with the minimum
 *   surface: drive the round to terminal-win, locate the caption by
 *   its CSS class, and pin the literal "Score" textContent.
 *
 * Strategy mirrors W1116 (PlayPage.endStatsClass.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — enough to
 *     drive PlayPage into the terminal-win branch where the end-panel
 *     and its `.final-score-label` caption mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, then locate `.final-score-label`
 *     via querySelector and assert its textContent equals "Score".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "final-score-label-text-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Final Score Label Text Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the final-score-label text test.",
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

describe("PlayPage .final-score-label text content (W1475)", () => {
  it("renders 'Score' as the .final-score-label caption text after a win", async () => {
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

    // Pre-condition: end-panel (and its .final-score-label caption) is
    // not mounted before the round terminates.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(container.querySelector(".final-score-label")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // The end-panel mounts only after the win transition.
    expect(screen.getByTestId("end-panel")).toBeTruthy();

    const label = container.querySelector(".final-score-label");
    expect(label).not.toBeNull();

    // Pin the visible caption text. The default English registry maps
    // `t("hud.score")` -> "Score" (web/src/platform/i18n.ts:56). A
    // regression that swapped the i18n key (e.g. to "hud.moves" =
    // "Moves") or stripped the JSX child would leave the class,
    // tagName, and structural slot intact but break the user-visible
    // label that tells players what the giant number means.
    expect(label?.textContent).toBe("Score");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
