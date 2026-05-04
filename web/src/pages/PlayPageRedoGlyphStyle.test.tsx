/**
 * Unit test for the PlayPage redo button glyph inline-style contract (W1302).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2001) renders the visible redo glyph as
 *     <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>↻</span>
 *   The inline `style` attribute hard-codes the optical sizing for the
 *   counterclockwise arrow so it visually balances against neighbouring
 *   icon buttons in the toolbar. Existing redo coverage pins:
 *     - W923 headerRedoButton: tagName/type/aria-label/aria-keyshortcuts/
 *       className tokens, the glyph's `aria-hidden="true"` and `↻` text,
 *       and the disabled→enabled gating.
 *     - W1140/W1152: disabled and enabled `title`.
 *     - W935 headerRedoTooltip: `data-tooltip="Redo"`.
 *   None of those pin the *inline style attribute* on the inner glyph
 *   span — so a regression that dropped `fontSize: 16` (icon shrinks to
 *   inherited toolbar font-size) or `lineHeight: 1` (vertical centring
 *   drifts) would slip past every existing assertion.
 *
 * Strategy mirrors PlayPage.headerRedoButton.test.tsx (W923) for the
 * fixture shape: hoisted single-action counter plugin so dispatching one
 * "inc" then clicking play-undo-btn parks a frame on the redo stack and
 * the redo button becomes enabled (which doesn't actually matter for the
 * style assertion, but keeps the fixture exercised end-to-end and
 * documents that this style is present in both disabled and enabled
 * states — the inline style is unconditional on phase === "playing").
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "redo-glyph-style-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Redo Glyph Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo glyph inline-style test.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps
// the render side-effect-free.
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

describe("PlayPage redo button glyph inline-style contract (W1302)", () => {
  it("pins the inner glyph span's font-size:16px and line-height:1 so toolbar sizing stays aligned", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Redo button only mounts once phase === "playing".
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;

    // Drive the redo stack to non-empty so the assertion holds in the
    // *enabled* state too (the inline style is unconditional, but this
    // documents that we exercised both branches of the disabled gate).
    fireEvent.click(screen.getByTestId("fx-inc"));
    fireEvent.click(screen.getByTestId("play-undo-btn"));
    expect(btn.disabled).toBe(false);

    const glyphSpan = btn.querySelector(
      "span[aria-hidden='true']",
    ) as HTMLSpanElement | null;
    expect(glyphSpan).not.toBeNull();

    // React serialises `{ fontSize: 16 }` to "font-size: 16px;" and
    // `{ lineHeight: 1 }` to "line-height: 1;" on the inline style.
    // Read via the DOM `style` interface so unit-suffix and casing are
    // the browser-canonical form rather than asserting a substring of
    // the raw attribute (which would be brittle to React minor-version
    // formatting drift).
    expect(glyphSpan!.style.fontSize).toBe("16px");
    expect(glyphSpan!.style.lineHeight).toBe("1");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
