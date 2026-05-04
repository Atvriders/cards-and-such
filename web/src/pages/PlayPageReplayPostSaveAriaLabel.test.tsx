/**
 * Unit test for the win-banner save-replay button aria-label stability
 * across the post-save state flip (W1358).
 *
 * Observable behavior:
 *   The `play-save-replay` button rendered inside the win banner declares
 *   a static `aria-label="Save replay"` (PlayPage.tsx ~line 2801) while
 *   its visible text content swaps from "Save replay" to "Replay saved"
 *   when `replaySaved` flips after a click. The aria-label is intentionally
 *   pinned to the *action* the button performs, not the post-state copy:
 *   assistive-tech users continue to hear it announced as the "Save replay"
 *   button after they have used it, which matches WAI-ARIA guidance that
 *   `aria-label` describes the control's purpose rather than its momentary
 *   visible text.
 *
 *   Sibling tests cover this attribute only in the pre-click state:
 *     - PlayPage.saveReplayBtnAriaLabel.test.tsx — pre-click aria-label
 *     - PlayPage.replaySaveLabel.test.tsx        — visible textContent flip
 *     - PlayPage.replaySaveDoubleClick.test.tsx  — persistence on re-click
 *   None of them assert that the aria-label survives the `replaySaved`
 *   flip. A regression that wires aria-label to the same ternary as the
 *   button's children (e.g. `aria-label={replaySaved ? "Replay saved" :
 *   "Save replay"}`) would slip past every existing test even though it
 *   would change what screen-reader users hear post-click. This test fills
 *   that gap with one focused equality check after the click.
 *
 * Strategy:
 *   - Reuse the `vi.hoisted` win-after-one-move fixture pattern from the
 *     sibling save-replay tests; one dispatch drops PlayPage into the
 *     terminal-win branch that mounts the button. Drive `?quickstart=1`
 *     so the setup screen is skipped.
 *   - Click the save button to flip `replaySaved` to true (visible text
 *     becomes "Replay saved"), then assert the aria-label is still the
 *     stable "Save replay" purpose label.
 *   - Read via `getAttribute("aria-label")` (not the accessible-name
 *     algorithm) so the test is unambiguously about the literal attribute
 *     value, not whatever fallback computed name the textContent would
 *     supply if the attribute disappeared.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as sibling replay-save tests so any future
// fixture-level change there is easy to mirror here. The reducer increments
// `moves`; isTerminal returns a positive-score payload as soon as
// `moves >= 1`, so a single dispatch from the fixture button drives PlayPage
// into the terminal-win branch that exposes the `play-save-replay` button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "replay-post-save-aria-label-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Replay Post-Save Aria Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for save-replay aria-label stability post-click.",
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
// terminal-win render side-effect-free, mirroring sibling tests.
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

describe("PlayPage win-banner save-replay post-click aria-label (W1358)", () => {
  it("keeps aria-label='Save replay' after the replaySaved label flip", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive the round to terminal-win so the save-replay button mounts.
    fireEvent.click(screen.getByTestId("fx-win"));

    const saveBtn = screen.getByTestId("play-save-replay");

    // Click to flip `replaySaved` true. The visible text content now
    // swaps to "Replay saved" (already covered by replaySaveLabel.test.tsx).
    fireEvent.click(saveBtn);
    // Sanity-check the visible flip actually fired so we know we're in
    // the post-save state when we read the aria-label below.
    expect(saveBtn.textContent).toBe("Replay saved");

    // The aria-label MUST stay the action label "Save replay" — not
    // mirror the visible text — so screen-reader users continue to
    // hear the button announced by its purpose, not its momentary
    // post-state copy. Read the literal attribute so coupling
    // aria-label to the `replaySaved` ternary fails this assertion.
    expect(saveBtn.getAttribute("aria-label")).toBe("Save replay");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
