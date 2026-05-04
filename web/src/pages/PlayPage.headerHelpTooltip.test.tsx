/**
 * Unit test for the PlayPage header help button data-tooltip attribute
 * contract (W970 — analog of W953 for the hint button and W935 for redo).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2124) renders a `<button data-testid="help-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   active plugin defines `howToPlay` text (or `tutorialSteps`). The
 *   button carries a `data-tooltip="How to play"` attribute that the
 *   toolbar's CSS hover-tooltip layer reads to render the floating label
 *   on pointer hover.
 *
 *   Sibling tests cover other facets of the same button:
 *     - W914 (headerHelpButton) pins tagName/type/aria-label/glyph
 *     - W691 (howToPlay-rendering) covers the popover contents
 *     - The gating (button hides when howToPlay is absent) is covered
 *       elsewhere.
 *   None of them assert anything about `data-tooltip` — so a regression
 *   that swapped it for "Help" (drift), removed the attribute entirely
 *   (no hover label at all), or made it dynamic to mirror some other
 *   state would slip past every existing test on this button.
 *
 * Strategy mirrors W953 (PlayPage.headerHintTooltip.test.tsx) — single
 * focused attribute pin — but reuses the W914 help-button fixture shape
 * because the help button needs `plugin.howToPlay` defined before it
 * will mount.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `howToPlay` must be a non-empty string so the iconbar branch
// (`plugin.howToPlay || tutorialSteps`) renders the help button. (Per the
// W691 finding: the help-btn is gated on howToPlay/tutorialSteps presence
// — without it the button never mounts and getByTestId would throw.)
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-help-tooltip-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Help Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header help-button data-tooltip test.",
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

describe("PlayPage header help button data-tooltip contract (W970)", () => {
  it("pins data-tooltip='How to play' so the CSS hover-tooltip layer surfaces a stable floating label", async () => {
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

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders a
    // floating label by reading `data-tooltip`. Drift to "Help" (terse
    // copy), losing the attribute entirely (no hover label at all), or
    // making it dynamic would all be invisible to every other test on
    // this button.
    expect(btn.getAttribute("data-tooltip")).toBe("How to play");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
