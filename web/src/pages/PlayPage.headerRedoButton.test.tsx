/**
 * Unit test for the PlayPage header redo button UI contract (W923).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1986) renders a `<button data-testid="play-redo-btn">`
 *   in the header iconbar whenever `phase === "playing"`. Unlike the help
 *   / info / settings header buttons (W900/W906/W914), the redo button
 *   carries a visible *text* glyph rather than an inline SVG — the
 *   counterclockwise arrow `↻` wrapped in `<span aria-hidden="true">` —
 *   plus a `play-iconbtn play-redo-btn` className pair, an aria-label of
 *   "Redo" (when the undo-count badge is hidden, the storage default), an
 *   aria-keyshortcuts contract listing the four hotkey combos, and a
 *   `disabled` flag that is initially true (no redo frames are parked
 *   until the user undoes a dispatch).
 *
 *   Sibling tests cover the click flow (W208 PlayPage.redoButton.test.tsx)
 *   and the redo-after-branch invariants (PlayPage.redoBranching), but no
 *   test pins the button's *visible UI attributes* in the playing phase —
 *   so a regression that swapped the aria-label for "Redo move" (drift),
 *   set `type="submit"` (form-bug), removed the `↻` glyph, or dropped the
 *   aria-keyshortcuts hint would slip past every existing test.
 *
 * Strategy mirrors PlayPage.redoButton.test.tsx (W208) for the fixture
 * shape and PlayPage.headerHelpButton.test.tsx (W914) for the attribute
 * pinning:
 *   - Hoisted minimal counter fixture whose reducer returns a *new* object
 *     on "inc" (so PlayPage's `next !== s` guard pushes an undo frame).
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Dispatch one inc → click play-undo-btn so the redo stack is non-empty
 *     and the button transitions from disabled→enabled (proving the
 *     gating contract before we pin the static attributes).
 *   - Pin the static UI attributes: tagName, type, aria-label,
 *     aria-keyshortcuts, className tokens, and the `↻` glyph.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture. The reducer must return a fresh object on every
// "inc" so PlayPage's `next !== s` guard pushes an undo frame; returning the
// same reference would silently drop the frame and the redo button would
// never become enabled, making the gating half of this test a no-op.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-redo-btn-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Redo Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the header redo-button UI test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
    isTerminal: () => null,
    component: ({
      state,
      dispatch,
    }: {
      state: State;
      dispatch: (a: Action) => void;
    }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
        <button
          data-testid="fx-inc"
          type="button"
          onClick={() => dispatch({ type: "inc" })}
        >
          inc
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
// render side-effect-free.
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

describe("PlayPage header redo button UI contract (W923)", () => {
  it("renders a <button type='button'> with 'Redo' a11y label, hotkey hint, ↻ glyph, and gates on redo-stack non-empty", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Redo button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract. With the undo-count badge disabled (the
    // localStorage default — readShowUndoCount returns false when the
    // key is absent), the aria-label is the bare word "Redo".
    expect(btn.getAttribute("aria-label")).toBe("Redo");

    // Hotkey-discovery contract — assistive tech reads aria-keyshortcuts
    // to surface the four supported combos. Drift here (e.g. dropping
    // Meta+Y on macOS) would silently break shortcut announcement.
    expect(btn.getAttribute("aria-keyshortcuts")).toBe(
      "Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y",
    );

    // ClassName contract — the iconbar relies on `play-iconbtn` for
    // shared sizing/hover styles and `play-redo-btn` as the per-button
    // hook (selectors in CSS + analytics).
    expect(btn.classList.contains("play-iconbtn")).toBe(true);
    expect(btn.classList.contains("play-redo-btn")).toBe(true);

    // Visible glyph contract — the counterclockwise arrow inside an
    // aria-hidden span is the only sighted-user signal that this is the
    // redo button. Replacing the glyph or dropping aria-hidden (which
    // would double-announce the symbol on top of the aria-label) would
    // break visual recognition or screen-reader UX.
    const glyphSpan = btn.querySelector("span[aria-hidden='true']");
    expect(glyphSpan).not.toBeNull();
    expect(glyphSpan?.textContent).toBe("↻");

    // Gating contract — initially disabled (redo stack empty), and a
    // single inc → undo cycle parks one frame on the redo stack which
    // must enable the button. Without this leg, a regression that hard-
    // coded `disabled={true}` would still pass the static-attribute
    // pins above.
    expect(btn.disabled).toBe(true);
    fireEvent.click(screen.getByTestId("fx-inc"));
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(btn.disabled).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
