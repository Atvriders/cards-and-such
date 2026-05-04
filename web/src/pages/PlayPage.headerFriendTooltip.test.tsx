/**
 * Unit test for the PlayPage header friend button data-tooltip attribute
 * contract (W968 — analog of W953 (hint), W935 (redo), and the other
 * header-iconbar tooltip tests).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2112) renders a `<button data-testid="play-friend-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   active plugin is flagged `players.multiplayer: true`. The button
 *   carries a `data-tooltip="Play with a friend"` attribute that the
 *   toolbar's CSS hover-tooltip layer reads to render the floating label
 *   on pointer hover. Distinct from the native `title=` attribute (which
 *   includes the parenthetical "(copies seeded link)"), the data-tooltip
 *   is the trimmed, stable hover label.
 *
 *   Sibling tests cover other facets of this same button:
 *     - PlayPage.friend.test.tsx covers the click-to-copy share-URL flow
 *     - PlayPage.friendShareTrack.test.tsx (W797) covers the analytics
 *       breadcrumb fired on click
 *   None of them assert anything about `data-tooltip` — so a regression
 *   that shortened the label, mirrored the verbose `title=` text, or
 *   dropped the attribute entirely (no hover label at all) would slip
 *   past every existing test on this button.
 *
 * Strategy mirrors W953 (PlayPage.headerHintTooltip.test.tsx) — single
 * focused attribute pin — but uses the multiplayer-capable fixture
 * pattern from W797 because the friend button only mounts when the
 * active plugin advertises `players.multiplayer: true`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture — vi.hoisted runs before vi.mock
// factories evaluate. `players.multiplayer: true` is the gate that
// mounts the friend button; the rest of the plugin shape is the
// minimal viable surface PlayPage needs to advance past setup.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-friend-tooltip-fixture";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Friend Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description:
      "Test-only multiplayer plugin for the header friend data-tooltip test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number): State => ({ seed }),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-seed">{state.seed}</span>
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

describe("PlayPage header friend button data-tooltip contract (W968)", () => {
  it("pins data-tooltip='Play with a friend' so the CSS hover-tooltip layer surfaces a stable label distinct from the verbose title= text", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Friend button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-friend-btn") as HTMLButtonElement;

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders
    // a floating label by reading `data-tooltip`. Drift to the verbose
    // title= copy ("Play with a friend (copies seeded link)"),
    // shortening to "Friend", or dropping the attribute entirely (no
    // hover label at all) would all be invisible to every other test
    // on this button.
    expect(btn.getAttribute("data-tooltip")).toBe("Play with a friend");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
