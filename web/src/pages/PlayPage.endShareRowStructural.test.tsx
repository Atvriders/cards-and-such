/**
 * Structural test for the PlayPage `.end-share-row` wrapper class (W1138).
 *
 * Observable behavior:
 *   When the round reaches a terminal-win, PlayPage.tsx (~line 2746)
 *   renders a `<div className="end-share-row" data-testid="end-share-row">`
 *   inside the `[data-testid="end-panel"]` section. The wrapper groups
 *   the share-pill cluster — `end-share-twitter`, `share-seed-end-btn`,
 *   `play-share-image-btn`, `play-print-btn`, and (on win) the
 *   replay-save button — into a single flex row whose typography,
 *   wrapping, and gap are governed by the `.end-share-row` rule in
 *   PlayPage.css. A rename or removal would silently strip the row's
 *   layout while the existing per-button tests (W endShareTwitter,
 *   shareEndCopiedLabel, lossBannerPrint, lossBannerSaveReplay,
 *   lossBannerShareImage, lossBannerShareSeed, lossBannerTwitter),
 *   which key off testids on the inner buttons, continued to pass.
 *
 *   Sibling tests pin each button's *behavior* (W shareEndCopiedLabel
 *   pins the copy-link label, W endShareTwitter pins the tweet
 *   handler, etc.) but no existing test pins the `.end-share-row`
 *   wrapper class itself — an exhaustive grep across the test suite
 *   turned up only doc-comment mentions, never a
 *   `classList.contains("end-share-row")` or
 *   `querySelector(".end-share-row")` assertion. This test fills that
 *   gap with the minimum surface: drive the round to terminal-win,
 *   locate the wrapper by its CSS class, and pin both the class
 *   itself and the structural invariant that the share-pill buttons
 *   live inside it.
 *
 * Strategy mirrors W1099 (PlayPage.endStatsStructural.test.tsx):
 *   - Hoisted minimal fixture plugin whose reducer flips `isTerminal`
 *     to a positive-score payload after one dispatch — enough to
 *     drive PlayPage into the terminal-win branch where the end-panel
 *     and its `.end-share-row` block mount.
 *   - Mount at `/play/:gameId?seed=42&quickstart=1` to skip setup.
 *   - Click the fixture's win button, then locate `.end-share-row`
 *     via querySelector and assert (a) the class is present, (b) it
 *     lives inside the end-panel, and (c) it contains the twitter
 *     and copy-link share buttons.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-share-row-structural-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Share Row Structural Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-share-row structural test.",
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

describe("PlayPage .end-share-row wrapper (W1138)", () => {
  it("renders an .end-share-row wrapper inside the end-panel containing the share-pill buttons", async () => {
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

    // Pre-condition: the end-panel (and therefore .end-share-row) is
    // not mounted before the round terminates — both live behind the
    // `phase === "ended" && finalScore !== null` render gate.
    expect(screen.queryByTestId("end-panel")).toBeNull();
    expect(container.querySelector(".end-share-row")).toBeNull();

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and
    // PlayPage transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel).toBeTruthy();

    const endShareRow = container.querySelector(".end-share-row");

    // Pin existence — a rename here detaches every .end-share-row
    // rule in PlayPage.css (flex layout, gap, wrap, padding).
    expect(endShareRow).not.toBeNull();
    // Pin the bare class — CSS rules key off the exact selector.
    expect(endShareRow?.classList.contains("end-share-row")).toBe(true);
    // Pin the structural relationship: .end-share-row is a descendant
    // of the end-panel section. A regression that hoisted it out of
    // the panel would break the contained layout context the CSS
    // assumes.
    expect(endPanel.contains(endShareRow as Node)).toBe(true);
    // Pin the load-bearing children: the twitter share button and
    // the copy-link button. Sibling tests pin each button's behavior
    // by testid; this assertion pins the *grouping* — i.e. that they
    // share the wrapper.
    expect(
      endShareRow?.querySelector('[data-testid="end-share-twitter"]'),
    ).not.toBeNull();
    expect(
      endShareRow?.querySelector('[data-testid="share-seed-end-btn"]'),
    ).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
