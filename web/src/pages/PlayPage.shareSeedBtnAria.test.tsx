/**
 * Unit test for the PlayPage `share-seed-btn` aria-label attribute (W1197).
 *
 * Observable behavior:
 *   While `phase === "playing"` the secondary toolbar mounts a button
 *   with `data-testid="share-seed-btn"`. The visible content of this
 *   button is a single inline SVG (three connected circles) marked
 *   `aria-hidden="true"`, leaving no accessible text for assistive
 *   technologies. The button therefore depends on `aria-label="Share
 *   seed"` to remain identifiable to screen readers. Pinning that
 *   contract here guards against silent regressions where a refactor
 *   drops the label, renames it, or accidentally localises it without
 *   plumbing the change through accessibility-aware code paths.
 *
 * Strategy:
 *   - Mirror the sibling `shareSeedBtnTitle` test scaffolding: a
 *     `vi.hoisted` fixture plugin keeps the games registry mock
 *     deterministic without dragging in the real catalogue or its
 *     transitive imports.
 *   - Mount the page, click `start-game` to advance to the playing
 *     phase, then assert `share-seed-btn` carries the exact
 *     `aria-label="Share seed"` value (the title attribute already has
 *     dedicated coverage in W1191; this test focuses on the SR-only
 *     contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — `vi.hoisted` evaluates before `vi.mock` factory
// bodies, mirroring the shareSeedBtnTitle sibling test.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-seed-btn-aria-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share Seed Btn Aria Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for share-seed-btn aria-label attribute test.",
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

describe("PlayPage share-seed-btn aria-label attribute (W1197)", () => {
  it('share-seed-btn carries aria-label="Share seed" for screen readers', async () => {
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
    // The icon-only button's accessible name comes solely from this
    // attribute; the inner SVG is aria-hidden, so dropping the label
    // would silently break screen-reader UX.
    expect(shareBtn.getAttribute("aria-label")).toBe("Share seed");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
