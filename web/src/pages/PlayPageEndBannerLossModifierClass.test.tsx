/**
 * Unit test for the PlayPage end-panel `end-panel--loss` modifier className
 * (W1739).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2655) renders the end-panel `<section>` with a
 *   composed className of the form:
 *     `end-panel${isWin ? " end-panel--win" : ""}${isLoss ? " end-panel--loss" : ""}${(showWinBanner || showLossBanner) ? " end-panel--banner" : ""}`
 *   The `end-panel--loss` modifier is the BEM-style hook that the
 *   PlayPage.css stylesheet keys loss-only styling off (muted border,
 *   neutral score colour, etc.) — without that token, the end-panel
 *   falls back to its neutral form even when the player lost the round.
 *
 *   Sibling tests cover related end-panel attributes on the loss branch:
 *     - W811  data-win="true" / "false": pins the boolean data attribute.
 *     - W1691 lossTitleTag: pins the `<h2 class="loss-banner-title">` tag.
 *     - W1713 lossEncClass: pins the encouragement <p> className.
 *     - W1732 winModifierClass: pins `end-panel--win` on the *win* branch.
 *   None of them assert the `end-panel--loss` *modifier class* on the
 *   end-panel <section> itself. A regression that flipped the ternary
 *   (e.g. `isLoss ? "" : " end-panel--loss"`), renamed the token to
 *   `end-panel-loss`, or dropped it entirely while data-win still
 *   resolved to "false" would silently slip past the existing assertions.
 *
 * Strategy:
 *   Mirror W1732's win-modifier fixture exactly, but flip the terminal
 *   payload to `{ score: 0 }` (the canonical losing-terminal shape, see
 *   PlayPage.tsx isWin discriminator `term.score > 0`) so the single
 *   dispatch drives PlayPage straight into the terminal-loss branch that
 *   mounts the end-panel with the `end-panel--loss` modifier — the exact
 *   class we want to pin. After the banner mounts, assert the end-panel's
 *   `classList` contains `end-panel--loss` and not `end-panel--win`.
 *   One attribute, one render — distinct from the data-win / title /
 *   encouragement tests that own those neighbouring attributes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W1732 — reducer increments `moves`,
// isTerminal returns a zero-score payload as soon as `moves >= 1`,
// so a single dispatch from the fixture button drives PlayPage straight
// into the terminal-loss branch that mounts the end-panel with the
// `end-panel--loss` modifier — the exact class we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-end-panel-loss-modifier-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner end-panel--loss Modifier Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for end-panel--loss modifier className assertion.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 0 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-lose"
          type="button"
          onClick={() => dispatch({ type: "lose-now" })}
        >
          lose
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
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss banner: end-panel exposes the 'end-panel--loss' modifier className (W1739)", () => {
  it("renders the end-panel <section> with the `end-panel--loss` modifier class on a loss", async () => {
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

    // Drive the round to terminal-loss. One click is enough — the fixture's
    // isTerminal flips on the first dispatch with score=0, which mounts
    // the end-panel and drives the className ternary into its `isLoss`
    // arm, appending the `end-panel--loss` modifier token.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-lose"));
    });

    // Sanity: the end-panel mounted in the loss branch (data-win="false").
    // Without this guard, the className check could pass for the wrong
    // reason — e.g. some unrelated element happens to share the className.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // The contract pin: the end-panel <section> carries the
    // `end-panel--loss` modifier class. Use classList.contains rather
    // than `className === "..."` so this stays compatible with the
    // sibling `end-panel--banner` token that the dialog-mounted form
    // also appends. A rename, deletion, or ternary flip on this specific
    // BEM token would fail this check without colliding with neighbouring
    // tests.
    expect(endPanel.classList.contains("end-panel--loss")).toBe(true);
    // Negative pin: the win modifier MUST NOT be present on a loss —
    // catches a regression that always appends both modifiers.
    expect(endPanel.classList.contains("end-panel--win")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
