/**
 * Unit test for the PlayPage header help button native `title` attribute
 * contract (W1185).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2131) renders a `<button data-testid="help-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   active plugin defines `howToPlay` text (or `tutorialSteps`). The
 *   button carries a native `title="How to play"` attribute which the
 *   browser surfaces as the OS-level tooltip on long hover (and which
 *   assistive tech may also expose as accessible description).
 *
 *   Sibling tests cover other facets of the same button:
 *     - W914 (headerHelpButton) pins tagName/type/aria-label/glyph
 *     - W970 (headerHelpTooltip) pins the data-tooltip attribute used by
 *       the custom CSS hover-tooltip layer
 *     - W691 (howToPlay-rendering) covers the popover contents
 *   None of them assert the native `title` attribute — so a regression
 *   that swapped it for "Help" (terse drift), removed the attribute
 *   entirely (no OS-level tooltip on long hover), or made it dynamic
 *   would slip past every existing test on this button.
 *
 * Strategy mirrors W970 (PlayPage.headerHelpTooltip.test.tsx) — single
 * focused attribute pin — but targets the `title` attribute instead of
 * `data-tooltip`. Both attributes happen to share the same string today
 * but each governs a distinct surface (browser native tooltip vs the
 * custom CSS hover-tooltip layer), so each warrants its own pin.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `howToPlay` must be a non-empty string so the iconbar branch
// (`plugin.howToPlay || tutorialSteps`) renders the help button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-help-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Help Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header help-button native title test.",
    howToPlay: "Click cards to play. Match suits to win.",
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

describe("PlayPage header help button native title contract (W1185)", () => {
  it("pins title='How to play' so the browser surfaces a stable native tooltip on long hover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Help button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("help-btn") as HTMLButtonElement;

    // Native `title` contract — the browser renders a native tooltip on
    // long hover by reading this attribute. Drift to "Help" (terse
    // copy), losing the attribute entirely (no native tooltip), or
    // making it dynamic would all be invisible to every other test on
    // this button.
    expect(btn.getAttribute("title")).toBe("How to play");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
