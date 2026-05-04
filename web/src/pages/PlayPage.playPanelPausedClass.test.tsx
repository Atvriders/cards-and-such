/**
 * W1126: Pinpoint test for the `.play-panel--paused` class modifier on the
 * play panel section. PlayPage renders:
 *
 *     <section className={`play-panel play-board${paused ? " play-panel--paused" : ""}`}>
 *
 * The modifier is what CSS keys off to dim / blur the play surface while the
 * game is paused. W1119 noticed there was no direct test asserting that the
 * class actually toggles in step with the `paused` state — the existing
 * pause tests only verify the overlay and the pause button's aria-pressed.
 * If a refactor accidentally dropped the modifier (e.g. moved it onto a
 * wrapper div or swapped the ternary order), CSS would silently stop
 * applying and no existing test would notice. This test pins it down.
 *
 * Mirrors the hoisted-fixture / fake-timer pattern from PlayPage.pause.test
 * so behaviour stays consistent across the pause-related suites.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — see PlayPage.pause.test.tsx for the rationale on
// why this is wrapped in vi.hoisted (vi.mock factories run before module-
// level const initialisers).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-panel-paused-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Play Panel Paused Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for play-panel--paused class assertions.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function mountAndStart(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  // Click "Start" to advance from the setup screen into the playing phase
  // — the .play-panel section only renders once phase === "playing".
  fireEvent.click(screen.getByTestId("start-game"));
}

describe("PlayPage .play-panel--paused class modifier (W1126)", () => {
  it("toggles play-panel--paused on the play-panel element when Esc pauses", async () => {
    await mountAndStart();

    // The fixture game element is rendered as a child of the .play-panel
    // <section>, so .closest('.play-panel') gives us the panel itself
    // without needing a dedicated test id (none is currently exposed,
    // and adding one would be a production-code change this test must
    // avoid). queryByTestId for "fixture-game" anchors the lookup to a
    // node we control via the hoisted fixture.
    const fixture = screen.getByTestId("fixture-game");
    const panel = fixture.closest(".play-panel");
    expect(panel).not.toBeNull();

    // Initially playing — the modifier must NOT be present. Using
    // classList.contains rather than a substring match on className so an
    // accidental rename like "play-panel--paused-new" wouldn't false-pass.
    expect(panel!.classList.contains("play-panel--paused")).toBe(false);

    // Press Escape on the window — outside any modal / form / contenteditable
    // this hits the pause-toggle keyboard handler and flips paused → true.
    fireEvent.keyDown(window, { key: "Escape" });

    // After pausing, the modifier MUST be applied. We re-query classList on
    // the same DOM node — React mutates className in place on re-render so
    // the original reference is still valid.
    expect(panel!.classList.contains("play-panel--paused")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
