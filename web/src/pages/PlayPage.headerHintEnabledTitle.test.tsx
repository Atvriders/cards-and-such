/**
 * Unit test for the PlayPage header hint button enabled-state `title`
 * branch (W1163, analog of W1151/W1152 enabled-title pins; sibling
 * W1157/W1140/W1147 cover disabled branches).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2015) renders the hint button's `title` as a
 *   nested ternary on `plugin.hint` and `(hintCooldownEnabled && hintCooldown > 0)`:
 *
 *       title={
 *         plugin.hint
 *           ? hintCooldownEnabled && hintCooldown > 0
 *             ? `Hint (ready in ${hintCooldown}s)`
 *             : "Hint"
 *           : "No hint available for this game"
 *       }
 *
 *   The disabled / cooldown branches have coverage:
 *     - W1157 (PlayPage.headerHintTitle.test.tsx) pins the
 *       "No hint available for this game" leaf when `plugin.hint` is
 *       absent.
 *     - W930 (PlayPage.headerHintCooldownLabel.test.tsx) pins the
 *       cooldown aria-label countdown.
 *
 *   The middle leaf — the static "Hint" string used when the plugin
 *   defines a hint() AND no cooldown is currently armed — has zero
 *   direct coverage. W953 only pins `data-tooltip="Hint"` (a separate,
 *   statically constant attribute), W922 only pins aria-label / type /
 *   glyph. A regression that swapped the enabled-state native title to
 *   the cooldown-format string (so "Hint (ready in NaNs)" leaked when
 *   no cooldown was running), dropped the title entirely (no hover
 *   feedback for desktop users on the ready-state button), or made it
 *   an empty string would slip past every existing test on this button.
 *
 * Strategy:
 *   - Hoisted minimal fixture WITH `hint()` defined so the outer
 *     ternary takes its truthy branch.
 *   - Pre-seed `cards-hints-enabled = "true"` (so the button mounts at
 *     all) and `cards-hint-cooldown = "false"` (so the inner ternary's
 *     `hintCooldownEnabled` predicate is false and the title collapses
 *     to the bare "Hint" leaf — even if a future default flip armed a
 *     cooldown, the gate would still short-circuit).
 *   - Mount, advance past setup, locate the hint button, assert
 *     `disabled === false` (sanity-pin so a regression freezing
 *     `disabled` to a constant `true` couldn't masquerade as a
 *     title-only change) and `title === "Hint"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `hint` is defined (returns a selector pointing at a real DOM node) so the
// outer `plugin.hint ? ... : ...` ternary takes its truthy branch and the
// inner cooldown-off ternary collapses to the bare "Hint" leaf.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-enabled-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Enabled Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin (hint() defined) for the W1163 enabled-title pin.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // hint() defined — drives the outer truthy branch. The selector
    // doesn't matter for this test (we never click the button) but we
    // point at a real node for parity with other hint-fixture tests.
    hint: () => ({ selector: "[data-testid='fx-count']" }),
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
  // Hints gated by Settings → Gameplay (`cards-hints-enabled`); make on
  // explicit so the button mounts even if the default flips later.
  localStorage.setItem("cards-hints-enabled", "true");
  // Cooldown gate explicitly OFF so the inner ternary's
  // `hintCooldownEnabled && hintCooldown > 0` predicate short-circuits
  // false and the title collapses to the bare "Hint" leaf — the branch
  // under test.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header hint button enabled-state title (W1163)", () => {
  it("renders title='Hint' when plugin.hint is defined and no cooldown is armed (the middle leaf of the title ternary)", async () => {
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

    // Sanity-pin: with `plugin.hint` defined and the cooldown gate off,
    // the `disabled={!plugin.hint || (hintCooldownEnabled && hintCooldown > 0)}`
    // predicate must be false. Without this, a regression that froze
    // `disabled` to a constant `true` could still leave the title
    // assertion passing if "Hint" leaked into a disabled branch — that
    // would be a different bug we don't want to mask here.
    expect(btn.disabled).toBe(false);

    // Native browser-tooltip contract for the enabled, no-cooldown
    // branch — the bare "Hint" string. Drift to the cooldown-format
    // string `Hint (ready in ${n}s)` (so a stale "NaNs" or "0s" leaks
    // when no cooldown is armed), the disabled-branch verbose copy
    // "No hint available for this game", an empty string (no hover
    // feedback at all), or removing the attribute entirely would all
    // slip past every other test on this button (W922 only checks
    // aria-label/type/glyph, W953 only checks data-tooltip which is
    // statically "Hint" in all states, W1157 only checks the
    // !plugin.hint branch).
    expect(btn.getAttribute("title")).toBe("Hint");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
