/**
 * Unit test for the win-banner save-replay button native `type` attribute
 * (W1285).
 *
 * Observable behavior:
 *   The `play-save-replay` button rendered inside the win banner is an
 *   explicit `<button type="button">`. Without `type="button"`, a button
 *   inside a form would default to `type="submit"`, which would cause the
 *   button to submit any ancestor form on click (or on Enter while focused
 *   inside that form) — silently triggering a navigation/page-reload in
 *   addition to the intended replay-save side effect.
 *
 *   PlayPage's end banner is not currently rendered inside a `<form>`, but
 *   the contract that every action button declares its non-submit role is
 *   defensive: a future refactor that wraps the page (or the share row) in
 *   a form must not turn the save-replay button into an accidental submit
 *   trigger. The siblings in the same end-share row (`end-share-twitter`,
 *   `play-share-image-btn`, `play-print-btn`, `share-seed-end-btn`) all
 *   set `type="button"` for the same reason.
 *
 *   Sibling tests already cover other UI contract attrs on this button:
 *     - PlayPage.saveReplayBtnAttr.test.tsx        — `title` tooltip
 *     - PlayPage.saveReplayBtnAriaLabel.test.tsx   — `aria-label`
 *     - PlayPage.saveReplayBtnClassName.test.tsx   — `className`
 *     - PlayPage.endSharePillsClassName.test.tsx   — shared share-pill class
 *   None of them assert on the native `type` attribute, leaving a gap
 *   that this test fills with a single focused equality check.
 *
 * Strategy:
 *   - Reuse the `vi.hoisted` win-after-one-move fixture pattern from
 *     sibling save-replay attr tests; one dispatch drops PlayPage into
 *     the terminal-win branch that mounts the button.
 *   - Assert exact-match on `getAttribute("type") === "button"`. Using
 *     `getAttribute` (not the IDL `.type` property) means dropping the
 *     literal attribute — which is what determines form-submit behavior
 *     in HTML — fails the test, even if the IDL default would still read
 *     "submit".
 *   - No click is dispatched on the save button itself: this test is
 *     about the static contract attr exposed on mount.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a
// positive-score payload as soon as `moves >= 1`, so a single dispatch
// from the fixture button drives PlayPage into the terminal-win branch
// that exposes the `play-save-replay` button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "save-replay-btn-type-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Save Replay Btn Type Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for replay-save button type attr.",
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

describe("PlayPage win-banner save-replay button type attr (W1285)", () => {
  it("declares type=\"button\" so it never acts as a form submit", async () => {
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

    // Drive the round to terminal-win so the save button mounts.
    fireEvent.click(screen.getByTestId("fx-win"));

    const saveBtn = screen.getByTestId("play-save-replay");

    // Lock the contract: removing the literal `type="button"` attribute
    // (which would let the button default to a form submit) fails this
    // assertion. We read the *attribute*, not the IDL property, because
    // the attribute is what HTML form-submission keys off of.
    expect(saveBtn.getAttribute("type")).toBe("button");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
