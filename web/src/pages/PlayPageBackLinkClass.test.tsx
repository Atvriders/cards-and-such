/**
 * Unit test for the PlayPage header back-to-lobby link `className` exact
 * equality contract (W1920).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2205) renders a `<Link to="/" className="play-backbtn"
 *   title="Back to lobby" aria-label="Back to lobby">` at the end of the
 *   header. This single class is the entire styling contract for the
 *   always-on recovery hatch off the play page — it persists across every
 *   phase (setup, playing, paused, win, loss).
 *
 *   The exact className string `"play-backbtn"` is what the page's CSS
 *   targets for sizing, color, hover state, focus ring, etc. Drift like
 *   `"play-backbtn play-icon"` (extra utility class), `"play-back-btn"`
 *   (renamed token), or accidental conditional concatenation
 *   (e.g. `play-backbtn ${active ? "is-active" : ""}` leaving a trailing
 *   space) would all change the rendered bytes and break visual contracts
 *   that no other test pins.
 *
 *   Sibling tests cover other facets of this same Link (W1386 pins the
 *   native `title`; W1185 et al. pin glyph aria/focusable; the
 *   unknownGame fallback test pins a *different* "Back to lobby" link in
 *   the not-found render path) but no existing test asserts exact
 *   equality of the className itself.
 *
 * Strategy mirrors W1386 (PlayPage.headerBackLinkTitle.test.tsx) — mount
 * with a minimal hoisted plugin, target the back link by its stable
 * `play-backbtn` class as an existence anchor, then assert exact string
 * equality of `className`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — minimal valid plugin so the registry lookup succeeds
// and PlayPage renders the header (which includes the back link in every
// phase, including the initial setup screen).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-back-link-class-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Back Link Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header back-to-lobby link className test.",
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

describe("PlayPage header back-to-lobby link className contract (W1920)", () => {
  it("pins className === 'play-backbtn' so the styling/structural token is the exact rendered string", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor by the stable class so the assertion is unambiguous about
    // which element is being pinned. The header back link is the only
    // `.play-backbtn` on the page.
    const back = container.querySelector(".play-backbtn") as HTMLAnchorElement | null;
    expect(back).not.toBeNull();

    // Exact-equality contract — any extra class, rename, or stray
    // whitespace will fail this assertion. Other sibling tests use
    // `.classList.contains` semantics (via `.querySelector(".play-backbtn")`
    // existence) which are insensitive to such drift.
    expect(back!.className === "play-backbtn").toBe(true);
    expect(back!.className).toBe("play-backbtn");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
