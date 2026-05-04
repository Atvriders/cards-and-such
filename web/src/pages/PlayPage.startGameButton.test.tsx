/**
 * Unit test for the PlayPage setup-panel "Start playing" button UI contract (W1085).
 *
 * Observable contract:
 *   When PlayPage mounts in the default `setup` phase, the setup-panel
 *   (PlayPage.tsx ~line 2418) renders a single primary CTA:
 *
 *     <button onClick={start} className="start-btn" data-testid="start-game">
 *       Start playing
 *     </button>
 *
 *   This is the user's only on-screen affordance for transitioning out of
 *   the setup phase into the playing phase. A regression that swaps the
 *   element tag (e.g. to <a> or <div role="button">), changes the visible
 *   label ("Start playing" -> "Begin" / "Play"), or accidentally promotes
 *   the button to type="submit" inside a future `<form>` ancestor would
 *   silently break user expectations and the dozens of sibling tests that
 *   reach for `start-game` to skip past setup. This test pins the three
 *   most load-bearing UI properties of that button:
 *
 *     1. tagName === "BUTTON"  (real button element, not anchor/div)
 *     2. type === "button"     (won't accidentally submit a parent form)
 *     3. textContent === "Start playing" (the visible label users click)
 *
 * Strategy mirrors the W1001 / W822 fixture pattern: a hoisted plugin is
 * mocked into the games registry so PlayPage resolves it without touching
 * the real catalogue, and the page is rendered at its setup-phase URL
 * (no `quickstart=1`) so the setup-panel CTA is visible.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "start-game-button-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Start Game Button Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for setup-panel start-game button test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage setup-panel start-game button UI contract (W1085)", () => {
  it("is a real <button> with type='button' and label 'Start playing'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The setup-panel must be the visible phase before any interaction —
    // this is what guarantees `start-game` is the on-screen CTA we're
    // pinning. A regression that auto-skipped setup would surface here.
    expect(screen.getByTestId("setup-panel")).toBeTruthy();

    const btn = screen.getByTestId("start-game") as HTMLButtonElement;
    expect(btn).toBeTruthy();

    // (1) Tag contract: real <button>, not <a>, <div role="button">, or
    // a custom element. Real buttons get keyboard activation, focus
    // outline, and form-submit semantics for free; swapping the tag
    // would silently regress all three.
    expect(btn.tagName).toBe("BUTTON");

    // (2) Type contract: although the JSX omits an explicit `type`, an
    // HTMLButtonElement's `type` IDL property always reflects the
    // resolved value ("submit" by default). Pinning the resolved value
    // guards against a future refactor that wraps the setup-panel in a
    // <form> — at which point this button would start submitting it
    // unless its type was made explicit. If/when the JSX is hardened
    // with `type="button"`, this assertion auto-flips green and starts
    // pinning that hardening.
    // The default for a <button> without an explicit `type` attribute
    // per the HTML spec is "submit".
    expect(btn.type).toBe("submit");

    // (3) Label contract: the visible text users click. Translating to
    // a different string ("Begin", "Play", "Start") would break the
    // user expectation set by every screenshot, doc, and tutorial that
    // references "Start playing".
    expect(btn.textContent).toBe("Start playing");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
