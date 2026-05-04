/**
 * Unit test for PlayPage win-banner hint paragraph (W840).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2816) renders, only when `showWinBanner` is true,
 *   a `<p data-testid="win-banner-hint">` paragraph below the end-actions
 *   that reads:
 *
 *     "Press <kbd>Enter</kbd> to play again, <kbd>Esc</kbd> to dismiss"
 *
 *   This copy is the user-facing prompt that advertises the keyboard flow
 *   covered behaviorally by W829 (autofocus on new-game-btn) and W834
 *   (Enter activates that button). Both of those tests exercise the
 *   keyboard semantics but neither asserts the hint paragraph itself
 *   renders, that the testid is present, or that the human-readable copy
 *   names BOTH the Enter and Esc keys via the dedicated `<kbd>` elements.
 *
 *   A regression that dropped the hint paragraph (e.g. removed the
 *   `{showWinBanner && <p ...>}` block during a layout refactor), reduced
 *   it to plain text without the `<kbd>` markup, or stripped one of the
 *   key names from the sentence would silently break the discoverability
 *   contract — players landing on the win banner without the hint would
 *   not know that Esc dismisses it. None of the existing PlayPage test
 *   files (W801/W825/W827/W829/W834/...) pin this paragraph.
 *
 * Strategy:
 *   Mirror the W829/W834 win-banner fixture (single-dispatch terminal-win,
 *   hoisted plugin, registry mock, confetti null-stub). After the banner
 *   mounts, assert:
 *     1. The `win-banner-hint` element is queryable (testid pin).
 *     2. Its text content names both "Enter" and "Esc" (so a future
 *        wording rewrite that keeps the keys discoverable still passes).
 *     3. Two `<kbd>` children carry those exact key names (markup pin
 *        protecting the visual key-cap styling that the .css file targets
 *        via `.win-banner-hint kbd`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W829/W834 — reducer increments `moves`,
// isTerminal returns a positive-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-win branch that mounts the win-banner-hint paragraph.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-hint-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner Hint Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner-hint paragraph assertion.",
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
// terminal-win render side-effect-free, mirroring the sibling tests.
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

describe("PlayPage win-banner hint paragraph (W840)", () => {
  it("renders the Enter/Esc keyboard hint with <kbd> key-caps when the win banner mounts", async () => {
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

    // Drive the round into terminal-win so the end-panel mounts and the
    // `{showWinBanner && <p ...>}` branch renders the hint paragraph.
    fireEvent.click(screen.getByTestId("fx-win"));

    // Sanity: end-panel mounted (the hint lives inside it).
    expect(screen.getByTestId("end-panel")).toBeTruthy();

    // (1) testid pin — the paragraph itself is rendered.
    const hint = screen.getByTestId("win-banner-hint");
    expect(hint).toBeTruthy();
    expect(hint.tagName.toLowerCase()).toBe("p");

    // (2) copy pin — both key names appear in the readable text. This
    // tolerates wording tweaks (e.g. "Hit Enter…") as long as Enter and
    // Esc remain discoverable to the player.
    const text = hint.textContent ?? "";
    expect(text).toMatch(/Enter/);
    expect(text).toMatch(/Esc/);

    // (3) markup pin — the two key names are wrapped in <kbd> elements,
    // the hook the .win-banner-hint kbd CSS rule uses to style key-caps.
    // A regression that flattened the markup to plain text would lose the
    // visual key-cap affordance; this assertion catches that.
    const kbds = hint.querySelectorAll("kbd");
    expect(kbds.length).toBe(2);
    const kbdTexts = Array.from(kbds).map((k) => (k.textContent ?? "").trim());
    expect(kbdTexts).toContain("Enter");
    expect(kbdTexts).toContain("Esc");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
