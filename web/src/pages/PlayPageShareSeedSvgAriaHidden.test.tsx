/**
 * Unit test for the PlayPage `share-seed-btn` inner SVG `aria-hidden`
 * attribute (W1297).
 *
 * Observable behavior:
 *   While `phase === "playing"` the secondary toolbar mounts a button
 *   with `data-testid="share-seed-btn"` whose visible content is a
 *   single inline SVG (three connected circles representing the share
 *   icon). The button itself carries `aria-label="Share seed"` to
 *   provide an accessible name; the inner SVG is therefore decorative
 *   and must be marked `aria-hidden="true"` so assistive technologies
 *   do not announce the icon as a separate, redundant element. Pinning
 *   that contract here guards against regressions where a refactor
 *   drops the `aria-hidden` flag, swaps the icon for one without it, or
 *   inadvertently exposes the SVG to screen readers.
 *
 * Strategy:
 *   - Mirror the sibling `shareSeedBtnAria` test scaffolding: a
 *     `vi.hoisted` fixture plugin keeps the games registry mock
 *     deterministic without dragging in the real catalogue or its
 *     transitive imports.
 *   - Mount the page, click `start-game` to advance to the playing
 *     phase, then locate `share-seed-btn` and assert its first child
 *     SVG carries `aria-hidden="true"` (sibling-attribute coverage for
 *     `aria-label`/`title`/`data-tooltip` lives in W1191/W1197/W1205;
 *     this test focuses on the decorative-icon contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — `vi.hoisted` evaluates before `vi.mock` factory
// bodies, mirroring the shareSeedBtnAria sibling test.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-seed-btn-svg-aria-hidden-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share Seed Btn SVG Aria-Hidden Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for share-seed-btn inner SVG aria-hidden attribute test.",
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

describe("PlayPage share-seed-btn inner SVG aria-hidden attribute (W1297)", () => {
  it('share-seed-btn inner SVG carries aria-hidden="true" so screen readers ignore the decorative icon', async () => {
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

    const svg = shareBtn.querySelector("svg");
    expect(svg).toBeTruthy();
    // The button supplies the accessible name via aria-label; the icon
    // itself is decorative and must opt out of the a11y tree.
    expect(svg!.getAttribute("aria-hidden")).toBe("true");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
