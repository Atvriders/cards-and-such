/**
 * W1347 — `play-share-image-btn` native `type="button"` attribute contract.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2767-2776) renders the win/loss banner Save-image
 *   button as `<button type="button">`. Without the explicit
 *   `type="button"`, a `<button>` defaults to `type="submit"`. If a future
 *   refactor wraps the end-banner share row in a `<form>` (or a parent
 *   element ever becomes one), an implicit-submit button would attempt
 *   form submission on click — causing a navigation or a noisy
 *   uncaught-promise rejection — instead of running `shareImage()` to
 *   build and download the SVG share card.
 *
 *   The sibling `play-save-replay` button has W1285 pinning its
 *   `type="button"`. The doc-comment in that test explicitly enumerates
 *   `play-share-image-btn`, `play-print-btn`, and `share-seed-end-btn`
 *   as buttons that "all set `type="button"` for the same reason" but
 *   *only asserts on `play-save-replay`*. Sibling tests on this button
 *   cover its aria-label (W1220), title (W1048), className (W1237),
 *   click-track (W796), download path (W192), and loss-banner variant —
 *   none assert on the native `type` attribute.
 *
 *   A regression that dropped the literal `type="button"` (defaulting to
 *   "submit") would slip past every existing test on this button until
 *   the day someone adds a wrapping `<form>` and the share-image click
 *   silently submits instead of downloading.
 *
 * Strategy mirrors the W1285 save-replay-type test:
 *   - Hoist a minimal one-shot fixture plugin reaching a terminal-win on a
 *     single dispatch so the win banner — and its share row — render.
 *   - Mount PlayPage at `/play/:gameId`, drive setup → playing, dispatch
 *     WIN so the banner mounts.
 *   - Locate `play-share-image-btn` and pin
 *     `getAttribute("type") === "button"` exactly. Using `getAttribute`
 *     (not the IDL `.type` property) catches attribute removal, since
 *     the IDL property defaults to "submit" via reflection regardless
 *     of whether the markup attribute is actually present.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// Hoisted fixture plugin reaching a terminal-win on a single dispatch.
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-image-type-w1347";
  type State = { won: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "W1347 Share Image Type Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning the share-image button's native type attr.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: 1 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-win"
          onClick={() => dispatch({ type: "WIN" })}
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

// Confetti pulls in canvas / matchMedia surfaces jsdom doesn't implement;
// null-stub keeps the render side-effect-free regardless of reduced-motion
// state in the test harness.
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

describe("PlayPage play-share-image-btn type attr (W1347)", () => {
  it("declares type=\"button\" so a future form-wrap never submits instead of downloading", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive: setup → playing, then dispatch WIN so the win banner — which
    // hosts the share row containing `play-share-image-btn` — mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-win"));
    });

    const shareBtn = screen.getByTestId("play-share-image-btn") as HTMLButtonElement;

    // Lock the contract on the *attribute* (not the IDL property): if the
    // literal `type="button"` is dropped from JSX, `.type` still reflects
    // "submit" by default, but `getAttribute("type")` returns null and
    // this assertion fails — surfacing the regression.
    expect(shareBtn.getAttribute("type")).toBe("button");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
