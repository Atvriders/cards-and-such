/**
 * Unit test for the PlayPage header hint button cooldown-active `title`
 * branch (W1169, sibling of W1163 enabled-title pin and W1157 disabled-
 * title pin).
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
 *   Existing coverage:
 *     - W1163 (PlayPage.headerHintEnabledTitle.test.tsx) pins the bare
 *       "Hint" middle leaf when plugin.hint is defined and no cooldown
 *       is currently armed.
 *     - W1157 (PlayPage.headerHintTitle.test.tsx) pins the "No hint
 *       available for this game" outer-falsey leaf when plugin.hint is
 *       absent.
 *     - W930 (PlayPage.headerHintCooldownLabel.test.tsx) pins the
 *       cooldown *aria-label* (the `Hint, available in Ns seconds`
 *       string). That's a different attribute on the same button — its
 *       wording diverges from `title` deliberately (verbose AT copy vs.
 *       terse desktop-tooltip copy).
 *
 *   The `title` attribute's *cooldown-active* leaf — the
 *   `Hint (ready in ${hintCooldown}s)` template literal — has zero
 *   direct coverage. A regression that re-worded it ("wait Ns",
 *   "Cooldown: Ns", silent), dropped the seconds interpolation
 *   (`Hint (ready in s)` or `Hint (ready in NaNs)`), or accidentally
 *   served the disabled-state verbose copy here would slip past every
 *   other test on this button.
 *
 * Strategy:
 *   - Hoisted minimal fixture WITH `hint()` defined (returns a selector
 *     pointing at a real DOM node so `showHint` reaches the
 *     `setHintCooldown(...)` arming step rather than bailing on the
 *     no-target guard).
 *   - Pre-seed `cards-hints-enabled = "true"` (so the button mounts at
 *     all) and `cards-hint-cooldown = "true"` (so the inner ternary's
 *     `hintCooldownEnabled` predicate is truthy and the title collapses
 *     to the cooldown-format leaf once `hintCooldown > 0`).
 *   - Install fake timers BEFORE mount with `shouldAdvanceTime: true`
 *     so the 1Hz cooldown ticker (PlayPage.tsx ~line 769-775) doesn't
 *     race synchronous click handling — `shouldAdvanceTime` lets
 *     microtasks / RAF callbacks complete naturally during the click
 *     while still letting us pin the just-armed cooldown value before
 *     any tick decrements it.
 *   - Click start to enter the playing phase, then click the hint
 *     button to arm the cooldown (HINT_COOLDOWN_MS / 1000 = 3s, so
 *     `Math.ceil(3000/1000) === 3` is the initial value; we tolerate
 *     1..3 to keep the test robust against scheduler timing on slow CI
 *     runs where a tick may have already fired).
 *   - Assert `btn.title` matches `/^Hint \(ready in [123]s\)$/`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `hint` is defined (returns a selector pointing at a real DOM node) so the
// outer `plugin.hint ? ... : ...` ternary takes its truthy branch AND the
// inner cooldown-armed ternary fires once we click the button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-cooldown-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Cooldown Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin (hint() defined) for the W1169 cooldown-title pin.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // Selector points at a real node in the rendered fixture component
    // so `document.querySelector(target.selector)` returns non-null and
    // `showHint` reaches `setHintCooldown(...)` instead of bailing on the
    // no-target guard (PlayPage.tsx ~line 946-948).
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
  // Cooldown gate explicitly ON (its real default-on too, per W775)
  // so the inner ternary's `hintCooldownEnabled` predicate is truthy
  // and the title swaps to the cooldown-format leaf once we click.
  localStorage.setItem("cards-hint-cooldown", "true");
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header hint button cooldown-active title (W1169)", () => {
  it("renders title='Hint (ready in Ns)' once the cooldown is armed (the cooldown leaf of the title ternary)", async () => {
    // Fake timers must be installed BEFORE mount so the cooldown
    // ticker's setInterval is captured. `shouldAdvanceTime: true` lets
    // the click handler's synchronous setState propagate without us
    // manually pumping the scheduler (just enough for React to flush
    // the re-render after `setHintCooldown(...)`).
    vi.useFakeTimers({ shouldAdvanceTime: true });

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

    // Sanity-pin: with `plugin.hint` defined and no cooldown yet armed,
    // the title should still be the bare "Hint" string. If this drifts
    // before the click, the cooldown-leaf assertion below would assert
    // the wrong branch.
    expect(btn.getAttribute("title")).toBe("Hint");

    // Click to fire the hint and arm the cooldown. HINT_COOLDOWN_MS is
    // 3000 in PlayPage.tsx, so `Math.ceil(3000 / 1000) === 3` is the
    // initial countdown value — and any 1Hz tick that's already fired
    // before our assertion would land on 2 (or 1), so we accept 1..3
    // to keep the test robust against scheduler timing on slow CI runs.
    fireEvent.click(btn);

    // Native browser-tooltip contract for the cooldown-active branch —
    // the templated `Hint (ready in ${n}s)` string. A regression that
    // re-worded the format ("wait Ns", "Cooldown: Ns"), dropped the
    // seconds interpolation (`Hint (ready in s)` or `NaNs`), or
    // accidentally served the verbose disabled-state copy here would
    // slip past every other test on this button (W1163 pins the bare
    // "Hint" leaf, W1157 pins the !plugin.hint leaf, W930 pins the
    // separate aria-label countdown which uses different wording).
    const titleAfter = btn.getAttribute("title") ?? "";
    expect(titleAfter).toMatch(/^Hint \(ready in [123]s\)$/);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
