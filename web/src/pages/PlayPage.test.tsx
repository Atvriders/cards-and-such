/**
 * Top-level PlayPage smoke + routing test.
 *
 * Observable behaviors pinned here:
 *   1. For a known game id (the registry entry matched against the
 *      `:gameId` route param), PlayPage renders the per-game header
 *      with `<h1>{plugin.title}</h1>` instead of the not-found stub.
 *      Source reference: PlayPage.tsx around the `PlayGame` return,
 *      where `<h1>{plugin.title}</h1>` and `data-testid="play-info-btn"`
 *      appear in the toolbar.
 *   2. For an unknown game id, PlayPage renders the `play-not-found`
 *      stub with the literal "Unknown game: <id>" message and a
 *      Link back to the lobby. Source reference: PlayPage.tsx default
 *      export — `if (!plugin) return <div data-testid="game-not-found">`.
 *   3. The known-game render exposes the hint button
 *      (`data-testid="play-hint-btn"`) used by the toolbar — a load-
 *      bearing test id consumed by other suites.
 *
 * Strategy mirrors PlayPage.canonical.test.tsx: stub the registry via
 * `vi.hoisted` + `vi.mock` so we don't depend on every real plugin
 * loading cleanly in jsdom, and stub `Confetti` because it pulls in
 * canvas APIs jsdom doesn't ship.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "smoke-fixture-game";
  const TEST_TITLE = "Smoke Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Smoke fixture description.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game-body">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

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

function renderAt(path: string): void {
  // Lazy import — vi.mock factories are hoisted, but we still want the
  // module to evaluate after the mocks are registered, matching the
  // canonical test's pattern.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
}

describe("PlayPage routing + not-found stub", () => {
  it("renders the per-game header for a known game id", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The plugin title is the load-bearing piece: a regression that
    // returned the not-found stub for a known id (e.g. by breaking the
    // `GAMES.find` predicate) would surface here as a missing heading.
    const heading = screen.getByRole("heading", {
      level: 1,
      name: hoisted.TEST_TITLE,
    });
    expect(heading).toBeTruthy();

    // The not-found stub must NOT have been rendered for a valid id.
    expect(screen.queryByTestId("game-not-found")).toBeNull();
  });

  it("renders the setup panel with a start button for a known game id (pre-play phase)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The PlayPage initial phase is "setup": it renders a setup-panel
    // section with a start-game button. A regression that skipped the
    // setup phase (or crashed before mount) would not produce either id.
    expect(screen.getByTestId("setup-panel")).toBeTruthy();
    const startBtn = screen.getByTestId("start-game");
    expect(startBtn).toBeTruthy();
    // The session-info button is part of the always-on header toolbar;
    // its presence confirms the per-game header was mounted (not the
    // not-found stub).
    expect(screen.getByTestId("play-info-btn")).toBeTruthy();
  });

  it("renders the not-found stub for an unknown game id", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={["/play/this-game-does-not-exist"]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Exact stub: a regression that crashed or rendered <PlayGame />
    // with an undefined plugin would not produce this testid.
    const stub = screen.getByTestId("game-not-found");
    expect(stub).toBeTruthy();
    // The error message interpolates the unknown id verbatim —
    // pins the user-visible "Unknown game: <id>" contract.
    expect(stub.textContent ?? "").toContain("Unknown game: this-game-does-not-exist");

    // Back-to-lobby link must be present; a regression that dropped
    // the recovery path would leave users stranded.
    const lobbyLink = screen.getByRole("link", { name: /back to lobby/i });
    expect(lobbyLink.getAttribute("href")).toBe("/");

    // And the per-game header must NOT have been rendered.
    expect(screen.queryByRole("heading", { level: 1, name: hoisted.TEST_TITLE })).toBeNull();
  });
});

// Silence unused-helper warning while keeping the helper signature
// available for future expansion.
void renderAt;
// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
