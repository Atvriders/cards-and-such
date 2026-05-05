/**
 * Unit test for the PlayPage primary-toolbar undo button className contract.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1964) renders the undo button with the exact
 *   className string `"play-iconbtn play-undo-btn"`. The `play-iconbtn`
 *   class hooks the button into the shared header iconbar styling (size,
 *   hover ring, focus outline, and the CSS hover-tooltip surface that
 *   consumes the `data-tooltip` attribute pinned by sibling tests). The
 *   `play-undo-btn` class is the per-button hook used to scope undo-specific
 *   styling without affecting other iconbar buttons. Sibling tests cover
 *   the button's tagName/type/aria-label/glyph (W924), the visible label
 *   span's className (W1444 — `play-hint-btn-label`), the count label,
 *   tooltip, keyshortcuts, and the disabled/enabled titles, but no test
 *   pins the *exact className string* on the undo button itself — so a
 *   regression that added/removed/reordered a class (for example, dropping
 *   `play-iconbtn` and breaking the hover ring + tooltip surface, or
 *   renaming `play-undo-btn` and breaking the per-button hook) would slip
 *   past every existing test.
 *
 * Strategy mirrors PlayPage.headerUndoButton.test.tsx (W924) and
 * PlayPageHintBtnClassName.test.tsx (W1254):
 *   - Hoisted minimal counter fixture so the registry resolves cleanly
 *     and we can advance to phase === "playing" via the start-game button
 *     (the undo button only renders while playing — it's *always* rendered
 *     then, just `disabled` when undoStack is empty, so we don't need to
 *     dispatch any actions to find it).
 *   - Mount at `/play/:gameId`, click `start-game`, then locate the button
 *     via its testid and assert `btn.className` is exactly
 *     `"play-iconbtn play-undo-btn"` (string equality, not classList
 *     contains — that catches stray additions, reorderings, and whitespace
 *     drift that classList checks would silently pass).
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
  const TEST_GAME_ID = "undo-btn-classname-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Undo Button ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo-button className test.",
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

describe("PlayPage primary-toolbar undo button className contract", () => {
  it("renders the undo button with className === 'play-iconbtn play-undo-btn' so the shared iconbar styling and per-button hook stay wired", async () => {
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

    // Exact-string equality — pins both classes, their order, and the
    // single-space separator. classList.contains() would silently pass
    // a regression that added a stray class, reordered the pair, or
    // doubled up whitespace.
    expect(btn.className).toBe("play-iconbtn play-undo-btn");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
