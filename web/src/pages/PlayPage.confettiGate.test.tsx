/**
 * Unit test for the PlayPage Confetti rendering gate (W825).
 *
 * Observable behavior:
 *   PlayPage.tsx (line 2832) renders `<Confetti onDone=... />` only when the
 *   `showConfetti` boolean is true, and that flag is set true exclusively in
 *   the two terminal branches (line 1230 and line 1354) that fire when
 *   `term.score > 0` — i.e. a *winning* terminal payload. A losing terminal
 *   (`{ score: 0 }`) leaves `showConfetti` false and the Confetti element
 *   stays unmounted. Sibling Confetti.tsx tests (W560/W648/W706) cover the
 *   component in isolation; the W805/W792 PlayPage tests stub Confetti to
 *   `null` and so cannot observe the gate. A regression that gated on
 *   `term.score >= 0`, dropped the `term.score > 0` guard, or mounted
 *   Confetti unconditionally would silently splash confetti over a *loss*
 *   screen — visible to players but invisible to the existing test suite.
 *
 * Strategy:
 *   - Hoist a single fixture plugin parameterised by a module-level
 *     `WIN_MODE` flag the test toggles per case. The reducer flips a
 *     terminal flag on one dispatch; `isTerminal` returns either
 *     `{ score: 100 }` or `{ score: 0 }` depending on `WIN_MODE`.
 *   - Mock the Confetti module with a sentinel-rendering stub
 *     (`<div data-testid="confetti-stub" />`) so the assertion is robust to
 *     jsdom's missing canvas / matchMedia surfaces while still observing
 *     whether PlayPage *chose* to mount the component. The real Confetti's
 *     own behavior is covered by W560/W648/W706.
 *   - Two `it()` cases — win-path mounts the sentinel, lose-path does not —
 *     using two separate `render()` invocations under a single `describe`
 *     block. Variants share the fixture by toggling `WIN_MODE` rather than
 *     declaring two registry mocks (`vi.mock` is hoisted and per-file, not
 *     per-test, so we cannot redefine it between cases).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. The fixture plugin reads `winMode.value` lazily inside
// `isTerminal` so each test can flip the flag *before* mounting PlayPage and
// the same registry mock serves both win and lose variants.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "confetti-gate-fixture";
  // Mutable container so test cases can flip win/lose mode at runtime.
  // Using an object lets `isTerminal` read the *current* value rather than
  // capturing the value at fixture-construction time.
  const winMode = { value: true };
  type S = { ended: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Confetti Gate Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the PlayPage confetti rendering-gate test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ ended: false }),
    reducer: (s: S, action: Action): S =>
      action?.type === "END" ? { ended: true } : s,
    // Score 100 in win mode (gate must mount Confetti); score 0 in lose mode
    // (gate must NOT mount Confetti). Both shapes satisfy the terminal
    // contract — the discriminator is `term.score > 0` per PlayPage.tsx.
    isTerminal: (s: S): { score: number } | null =>
      s.ended ? { score: winMode.value ? 100 : 0 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fx-end"
          onClick={() => dispatch({ type: "END" })}
        >
          end
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, winMode, fixturePlugin };
});

// PlayPage resolves the plugin via the games registry — substitute the
// fixture so we don't drag the real catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Stub Confetti with an observable sentinel. The real Confetti component
// pulls in viewport/matchMedia surfaces and returns `null` under reduced-
// motion preferences, neither of which we want to depend on here. The
// sentinel lets us observe ONLY the gating decision PlayPage makes — the
// component's own internals are covered by W560/W648/W706.
vi.mock("../platform/Confetti.js", () => ({
  default: () => <div data-testid="confetti-stub" />,
  Confetti: () => <div data-testid="confetti-stub" />,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage confetti rendering gate (W825)", () => {
  it("mounts <Confetti /> when isTerminal returns score > 0 (winning terminal)", async () => {
    hoisted.winMode.value = true;
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: confetti is NOT mounted before the round ends — the
    // `showConfetti` flag starts false and only flips inside the
    // `term.score > 0` branch.
    expect(screen.queryByTestId("confetti-stub")).toBeNull();

    // Drive the round to a winning terminal.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-end"));
    });

    // Win-gate assertion: Confetti must now be mounted.
    expect(screen.getByTestId("confetti-stub")).toBeTruthy();
  });

  it("does NOT mount <Confetti /> when isTerminal returns score === 0 (losing terminal)", async () => {
    hoisted.winMode.value = false;
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition mirrors the win case: confetti must not be mounted
    // before the terminal dispatch.
    expect(screen.queryByTestId("confetti-stub")).toBeNull();

    // Drive the round to a *losing* terminal (score === 0).
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-end"));
    });

    // Lose-gate assertion: Confetti must REMAIN unmounted. A regression
    // that drops the `term.score > 0` guard (e.g. `term.score >= 0`,
    // unconditional `setShowConfetti(true)`) would surface here.
    expect(screen.queryByTestId("confetti-stub")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
