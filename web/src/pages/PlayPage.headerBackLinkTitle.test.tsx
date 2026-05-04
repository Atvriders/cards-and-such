/**
 * Unit test for the PlayPage header back-to-lobby link native `title`
 * attribute contract (W1386).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2205) renders a `<Link to="/" class="play-backbtn"
 *   title="Back to lobby" aria-label="Back to lobby">` at the end of the
 *   header. This link is the always-on recovery hatch off the play page —
 *   it persists across every phase (setup, playing, paused, win, loss).
 *
 *   The native `title` attribute is what surfaces as the OS-level tooltip
 *   on long hover. It is independent of the custom CSS tooltip layer
 *   (which other header controls use via `data-tooltip`) and of the
 *   accessible name (`aria-label`).
 *
 *   Sibling tests cover other facets of header buttons (icon-bar tooltips,
 *   help/settings/info titles, etc.) but no test pins the back link's
 *   native `title`. The unknownGame fallback test (W911) covers a
 *   different "Back to lobby" link inside the not-found container — that
 *   one has only the visible link text and `to="/"` pinned, no `title`.
 *
 *   A regression that dropped the attribute (no OS tooltip on long
 *   hover), drifted the copy ("Lobby", "Home"), or made the value
 *   dynamic would slip past every existing test.
 *
 * Strategy mirrors W1185 (PlayPage.headerHelpTitle.test.tsx) — mount with
 * a minimal hoisted plugin, target the back link by its stable
 * `play-backbtn` class, and assert the exact title string.
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
  const TEST_GAME_ID = "header-back-link-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Back Link Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header back-to-lobby link native title test.",
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

describe("PlayPage header back-to-lobby link native title contract (W1386)", () => {
  it("pins title='Back to lobby' so the browser surfaces a stable native tooltip on long hover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Locate the back link by its stable structural class. The back link
    // is the only `.play-backbtn` element on the page; querying by class
    // (rather than role/name) sidesteps any conflict with the duplicate
    // "Back to lobby" link rendered by the unknown-game fallback in a
    // different render path.
    const back = container.querySelector(".play-backbtn") as HTMLAnchorElement | null;
    expect(back).not.toBeNull();

    // Native `title` contract — the browser renders a native tooltip on
    // long hover by reading this attribute. Drift to "Lobby" (terse
    // copy), losing the attribute entirely (no native tooltip), or
    // making it dynamic would all be invisible to every other test on
    // this link (which only covers `aria-label`, `href`, and visible
    // text).
    expect(back!.getAttribute("title")).toBe("Back to lobby");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
