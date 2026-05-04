/**
 * Unit test for the PlayPage `share-seed-btn` title attribute (W1191).
 *
 * Observable behavior:
 *   While `phase === "playing"` the secondary toolbar mounts a button
 *   with `data-testid="share-seed-btn"`. Its native `title` attribute
 *   defaults to `"Share seed"` (it flips to `"Seed URL copied!"` only
 *   after a successful copy). The browser tooltip is the only hint
 *   sighted users get on hover for this iconic button, so the default
 *   title is a small but real UX contract worth pinning.
 *
 * Strategy:
 *   - Mirror the sibling `seedCopy` test: a `vi.hoisted` minimal
 *     fixture plugin keeps the games registry mock deterministic
 *     without dragging in the real catalogue.
 *   - Mount the page, click `start-game` to reach the playing phase,
 *     then assert `share-seed-btn` carries `title="Share seed"` before
 *     any click happens (the post-click "copied" state has its own
 *     coverage in the seedCopy/shareEnd tests).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — `vi.hoisted` evaluates before `vi.mock` factory
// bodies, mirroring the seedCopy sibling test.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-seed-btn-title-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share Seed Btn Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for share-seed-btn title attribute test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (s: { seed: number }) => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't implement; null-stub keeps
// the render side-effect-free.
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

describe("PlayPage share-seed-btn title attribute (W1191)", () => {
  it('share-seed-btn carries title="Share seed" before any copy event', async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=7`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so phase === "playing" and share-seed-btn mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const shareBtn = screen.getByTestId("share-seed-btn");
    expect(shareBtn).toBeTruthy();
    // The default (non-copied) tooltip text. Pinning the exact string
    // ensures any future copy edits stay intentional rather than drift.
    expect(shareBtn.getAttribute("title")).toBe("Share seed");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
