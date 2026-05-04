/**
 * Unit test for the PlayPage overflow ("more actions") button toggle (W1016).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2061) renders a mobile-only ••• overflow button
 *   (`data-testid="play-overflow-btn"`) that toggles the secondary
 *   toolbar group between collapsed and expanded states. The button
 *   declares a *dynamic* `aria-expanded={overflowOpen}` and the sibling
 *   secondary group (`data-testid="play-toolbar-secondary"`) carries a
 *   matching `data-overflow-open` attribute that flips between "false"
 *   and "true" so CSS can reveal the otherwise-hidden popover on
 *   sub-600px viewports. The same `overflowOpen` state drives both
 *   attributes — a regression that wired one to a stale value, hard-
 *   coded the boolean, or removed the toggle handler would silently
 *   leave mobile players unable to reach share/friend/help/settings/
 *   fullscreen.
 *
 *   Sibling tests cover:
 *     - W929 toolbarSecondaryRole: pins `role="menu"` on the wrapper —
 *       does NOT exercise the click toggle or the data-overflow-open
 *       attribute.
 *     - W929-adjacent tests cover the *contents* of the secondary group
 *       (share / friend / help / settings buttons) but assume the
 *       overflow handler already worked.
 *
 *   No existing test pins the click → state-flip contract for the
 *   overflow button itself, leaving the mobile disclosure mechanism
 *   completely untested.
 *
 * Strategy mirrors PlayPage.headerSettingsAriaExpanded.test.tsx (W981):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the overflow button is gated by `phase === "playing"`).
 *   - Read aria-expanded + data-overflow-open BEFORE click — both must
 *     reflect the closed state ("false").
 *   - Click `play-overflow-btn`.
 *   - Read both attributes AFTER click — both must flip to "true". This
 *     belt-and-braces both endpoints of the same state binding so a
 *     regression that updated one but not the other still fails loudly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "overflow-btn-toggle-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Overflow Btn Toggle Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the overflow-button toggle test.",
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

describe("PlayPage overflow button toggle (W1016)", () => {
  it("flips aria-expanded and data-overflow-open from 'false' to 'true' on click", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The overflow button only mounts in the playing phase, so advance
    // past the setup screen first — this also matches how a real mobile
    // user would encounter the disclosure mechanism mid-session.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-overflow-btn");
    const menu = screen.getByTestId("play-toolbar-secondary");

    // Before click: closed state. Both endpoints of the same `overflowOpen`
    // binding must reflect "false". A regression that hard-coded either
    // attribute to "true" or wired it to the wrong state variable would
    // fail here.
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(menu.getAttribute("data-overflow-open")).toBe("false");

    // Activate the toggle.
    fireEvent.click(btn);

    // After click: open state. Both attributes MUST flip to "true". We
    // re-read from the same element references; React updates the live
    // attributes in place when the bound state changes. Asserting BOTH
    // catches a regression that updated one binding but not the other.
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(menu.getAttribute("data-overflow-open")).toBe("true");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
