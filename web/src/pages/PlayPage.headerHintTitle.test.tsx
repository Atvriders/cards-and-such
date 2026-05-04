/**
 * Unit test for the PlayPage header hint button native `title=` attribute
 * — disabled branch (W1157, analog of W1140/W1147 disabled-title pins;
 * W1151/W1152 cover the enabled-title branches separately).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2015) renders the hint button with a dynamic
 *   `title` attribute that takes one of three values depending on
 *   plugin + cooldown state:
 *
 *     plugin.hint && cooldown active  → `Hint (ready in ${n}s)`
 *     plugin.hint && cooldown idle    → "Hint"
 *     !plugin.hint                    → "No hint available for this game"
 *
 *   The third branch (W1157) — the verbose copy that explains *why* the
 *   button is disabled — is not pinned by any existing test. The W953
 *   sibling pins `data-tooltip` (which is statically "Hint" in all
 *   states), W922 pins aria-label/type/glyph, hintGating pins the
 *   `disabled` attribute itself, but none assert that the native
 *   browser tooltip surfaces the explanatory copy when a plugin lacks
 *   `hint()`. A regression that swapped the string for "Hint"
 *   (silently dropping the explanation), made it empty (no hover
 *   feedback at all on a disabled control), or dropped the title
 *   entirely would slip past every existing test on this button.
 *
 * Strategy mirrors W953 (PlayPage.headerHintTooltip.test.tsx) and W922
 * (PlayPage.headerHintButton.test.tsx) — single focused attribute pin
 * — but flips the fixture so `plugin.hint` is **undefined**. That is
 * the only configuration that drives the third title branch:
 *   - The button still mounts (the `phase === "playing" && hintsEnabled`
 *     gate around the JSX makes no reference to `plugin.hint`).
 *   - The `disabled={!plugin.hint || ...}` predicate evaluates true,
 *     which is fine for this test — we never click, only inspect the
 *     `title` attribute.
 *   - The `title=` ternary collapses to the "No hint available for
 *     this game" leaf.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// CRITICALLY, `hint` is omitted so the `disabled={!plugin.hint || ...}` gate
// evaluates true and the title ternary collapses to the
// "No hint available for this game" branch.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-title-disabled-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Title (Disabled) Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin (no hint() defined) for the disabled title pin.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // No `hint` field — that's the whole point of this fixture. The
    // header still renders the button (the outer `phase === "playing"
    // && hintsEnabled` gate doesn't check `plugin.hint`), but the
    // button is disabled and the title falls through to the verbose
    // explanatory copy.
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
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
  // Hints are gated by a Settings → Gameplay toggle (`cards-hints-enabled`).
  // Make the on-state explicit so the button mounts.
  localStorage.setItem("cards-hints-enabled", "true");
  // Cooldown setting is irrelevant for the !plugin.hint branch (the
  // outer ternary short-circuits on plugin.hint first), but we pin it
  // off anyway to keep the surrounding shape stable.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header hint button title contract — disabled branch (W1157)", () => {
  it("renders title='No hint available for this game' when the active plugin lacks a hint() function", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=7`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Hint button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn") as HTMLButtonElement;

    // Native browser-tooltip contract for the disabled state — pin the
    // verbose explanation that surfaces *why* the button is dimmed when
    // the active plugin has no hint() function. Drift to "Hint" (loses
    // the explanation), an empty string (no feedback), or removing the
    // attribute entirely would slip past every other test on this
    // button (W922 only checks aria-label/type/glyph, W953 only checks
    // data-tooltip which is statically "Hint" in all states).
    expect(btn.getAttribute("title")).toBe("No hint available for this game");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
