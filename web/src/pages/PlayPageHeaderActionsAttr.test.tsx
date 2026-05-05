/**
 * Pin test for the PlayPage `.play-header-actions` wrapper's exact
 * `className` string (W1956).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1786) renders the action cluster wrapper as
 *
 *     <div className="play-header-actions">
 *
 *   with a SOLE class — no secondary modifier, no state-flag class, no
 *   utility class concatenation. The `play-header-actions` class is the
 *   sole anchor for the action-cluster CSS in PlayPage.css covering its
 *   flex layout, gap, wrap behavior, alignment, and responsive collapse
 *   below 600px.
 *
 *   Existing tests in this suite cover:
 *     - tagName === "DIV"
 *       (PlayPageToolbarActionsClass.test.tsx W1300, line 102)
 *     - classList.contains("play-header-actions")
 *       (PlayPageToolbarActionsClass.test.tsx W1300, line 103;
 *        PlayPageHeaderChildCount.test.tsx W1947, line 109)
 *     - childElementCount of the parent `.play-header` is exactly 2
 *       (PlayPageHeaderChildCount.test.tsx W1947, line 102)
 *
 *   The `classList.contains` check would still pass if a refactor
 *   silently appended an extra class (e.g. "play-header-actions
 *   play-header-actions--compact" or a state-driven flag). That kind
 *   of drift would alter CSS specificity and could shift selector
 *   matching for any rule that targets `[class="play-header-actions"]`
 *   or that applies a different cascade weight to the bare class. No
 *   test pins the exact `className` string equality for this element.
 *
 * Strategy mirrors PlayPageToolbarActionsClass.test.tsx (W1300) and
 * PlayPageHeaderChildCount.test.tsx (W1947):
 *   - Hoisted minimal fixture plugin: no game logic, no canvas, no RNG.
 *   - Mount at `/play/:gameId` with a deterministic seed; the wrapper
 *     renders unconditionally — it appears in setup as well as playing
 *     — so no phase advance is required.
 *   - Locate the wrapper by its CSS class via querySelector.
 *   - Pin `className === "play-header-actions"` (strict equality on the
 *     attribute string), the uncovered observable attribute.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-actions-attr-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Actions Attr Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-header-actions className attr test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
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
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage .play-header-actions exact className attr (W1956)", () => {
  it("renders className exactly 'play-header-actions' with no extra classes", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const actions = container.querySelector(".play-header-actions");
    expect(actions).not.toBeNull();

    // Pin the exact className string. A silent additional class
    // ("play-header-actions foo") would still satisfy a contains-style
    // check but would alter CSS specificity and could shift selector
    // matching for rules keyed off the bare class.
    expect((actions as HTMLElement).className).toBe("play-header-actions");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
