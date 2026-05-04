/**
 * Unit test for the PlayPage primary-toolbar undo button UI contract (W924).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1962) renders a `<button data-testid="play-undo-btn">`
 *   inside the `.play-toolbar-primary` group while phase === "playing". It
 *   is a `type="button"` (so a stray ancestor <form> can never swallow Enter
 *   and submit), it carries an aria-label of "Undo" (the default short
 *   form when the user-facing "show undo count" preference is off — which
 *   is the default since `readShowUndoCount()` returns false when the
 *   localStorage key is absent, see PlayPage.tsx ~line 207), and it shows
 *   a visible "⟲" glyph as the only sighted-user signal. Sibling tests
 *   cover the Ctrl+Z hotkey path (W765) and undo-stack gating
 *   (PlayPage.undoGating), but no test pins the *visible UI attributes* of
 *   the button itself — so a regression that swapped the aria-label to
 *   "Back" (drift), set `type="submit"` (form-bug), or replaced the "⟲"
 *   glyph with an SVG / different unicode would slip past every existing
 *   test.
 *
 * Strategy mirrors PlayPage.headerInfoButton.test.tsx (W900),
 * PlayPage.headerHelpButton.test.tsx (W906), and
 * PlayPage.headerSettingsButton.test.tsx (W914):
 *   - Hoisted minimal counter fixture so the registry resolves cleanly
 *     and we can advance to phase === "playing" via the start-game button
 *     (the undo button only renders while playing — it is *always*
 *     rendered then, just `disabled` when undoStack is empty, so we don't
 *     need to dispatch any actions to find it).
 *   - Mount at `/play/:gameId`, click `start-game`, then locate the button
 *     via its testid and pin four static attributes:
 *       1. tagName === BUTTON  (not <a>, not <div role="button">).
 *       2. type === "button"   (so a future form wrapper can't submit).
 *       3. aria-label === "Undo" (screen-reader contract, default form).
 *       4. textContent.trim() === "⟲" (visible glyph contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — vi.hoisted runs before vi.mock factories
// evaluate, so the registry mock below can close over `fixturePlugin`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-undo-btn-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Undo Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo-button UI test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div data-testid="fx-count">{state.count}</div>
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

describe("PlayPage primary-toolbar undo button UI contract (W924)", () => {
  it("renders a <button type='button'> with the 'Undo' a11y label and visible '⟲' glyph", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar group (which gates the undo button on
    // `phase === "playing"`) mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // The undo button is *always* rendered while playing — it's just
    // `disabled` when undoStack is empty (which it is right after start),
    // so we don't need to dispatch any actions to find it.
    const btn = screen.getByTestId("play-undo-btn");

    // Tag-name contract — anchors and div-role-buttons would break
    // browser-native focus + Enter/Space activation and `disabled`
    // semantics.
    expect(btn.tagName).toBe("BUTTON");

    // Explicit type — a missing or "submit" type would let a future
    // ancestor <form> swallow Enter and submit the page.
    expect(btn.getAttribute("type")).toBe("button");

    // Screen-reader contract — the button has no visible text label
    // (just the "⟲" glyph) when `showUndoCount` is off (the default,
    // since `readShowUndoCount()` returns false when the localStorage
    // key is absent — and we cleared localStorage in beforeEach), so
    // the aria-label *is* the only label.
    expect(btn.getAttribute("aria-label")).toBe("Undo");

    // Visible glyph contract — the only sighted-user signal that this
    // is the undo button. Swapping for an SVG, "↶", or a different
    // unicode would break visual recognition while a11y stayed green.
    // With showUndoCount=false the trailing label span doesn't render,
    // so textContent collapses to just the glyph.
    expect(btn.textContent?.trim()).toBe("⟲");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
