/**
 * Unit test for the PlayPage unknown-gameId fallback (W911).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 480) reads the `:gameId` URL param via
 *   `useParams()` and looks it up against the GAMES registry. When no
 *   plugin matches the requested id (typo, deleted/renamed game, or a
 *   stale bookmark) the component short-circuits the render before the
 *   PlayGame skeleton is reached and shows a "Game not found" fallback:
 *
 *     <div className="play-not-found" data-testid="game-not-found">
 *       <PageHead title="Game not found" />
 *       <p>Unknown game: {gameId}</p>
 *       <Link to="/">Back to lobby</Link>
 *     </div>
 *
 *   This is the only UX hatch a player gets when they land on an
 *   invalid /play/:gameId — without the fallback the page would either
 *   crash trying to dereference `plugin.title` or render a fully blank
 *   screen, both of which would silently strand the user.
 *
 *   No sibling test pins this branch — every other PlayPage test mocks
 *   the registry to inject a valid fixture and immediately follows the
 *   happy path through PlayGame. A regression that (for example)
 *   swapped `if (!plugin)` for `if (plugin == null && gameId == null)`,
 *   or removed the data-testid, or replaced the echoed `gameId` text
 *   with a generic string, would silently break recoverability for
 *   anyone arriving at a stale URL.
 *
 * Strategy:
 *   - Mock the registry with a single unrelated plugin so the lookup
 *     against `this-game-does-not-exist` is guaranteed to miss without
 *     depending on the real registry's contents (which churn as games
 *     are added/removed).
 *   - Mount PlayPage at `/play/this-game-does-not-exist` via
 *     MemoryRouter + Routes so `useParams().gameId` resolves to the
 *     unknown id (mirrors how App.tsx wires the route).
 *   - Pin three properties of the rendered fallback:
 *       1. The `data-testid="game-not-found"` container exists — this
 *          is the stable hook the not-found branch advertises.
 *       2. Its text content includes the verbatim unknown gameId so
 *          the user can see what they tried to load (and copy/share it
 *          when reporting a broken link).
 *       3. A "Back to lobby" link exists so the user has a recovery
 *          path off the dead-end page.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — a single plugin whose id deliberately doesn't match
// the path we mount at, guaranteeing GAMES.find(...) returns undefined
// regardless of what the real registry currently contains.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const decoyPlugin = {
    id: "some-other-real-game",
    title: "Decoy Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Decoy plugin so the registry isn't empty.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="decoy-game">decoy</div>,
  };
  return { decoyPlugin, UNKNOWN_ID: "this-game-does-not-exist" };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.decoyPlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free in case any code path imports it eagerly.
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

describe("PlayPage unknown gameId fallback (W911)", () => {
  it("renders the not-found container with the offending id and a back link", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.UNKNOWN_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // 1. The not-found container is the stable testid hook for this
    //    branch. A regression that removed it (or accidentally fell
    //    through to PlayGame on a missing plugin) would surface here.
    const notFound = screen.getByTestId("game-not-found");
    expect(notFound).not.toBeNull();

    // 2. The echoed gameId helps the user recognize what they tried to
    //    open (and is the only diagnostic on a dead-end page). Pinning
    //    the substring guards against a regression that swapped the
    //    interpolated id for a static "Unknown game." message.
    expect(notFound.textContent).toContain(hoisted.UNKNOWN_ID);

    // 3. Recovery path: there must be a link back to the lobby ("/")
    //    so the user isn't stranded. We assert by accessible name so
    //    a regression that turned the link into an unstyled <a> with
    //    no text would still trip the test.
    const back = screen.getByRole("link", { name: /back to lobby/i });
    expect(back).not.toBeNull();
    expect(back.getAttribute("href")).toBe("/");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
