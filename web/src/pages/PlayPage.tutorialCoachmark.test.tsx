/**
 * Unit test for PlayPage per-game tutorial coachmark auto-launch (W696).
 *
 * Distinct from the howToPlay modal flow tested in PlayPage.howToPlay.test.tsx
 * (W589 / W685 / W691) — this exercises the `tutorialFor()` overlay that
 * auto-mounts the first time the user enters a game whose id has tutorial
 * steps registered in `platform/tutorials.ts`. The flow is gated on the
 * `cards-tutorial-seen` localStorage map, so once the user dismisses it the
 * overlay must not re-mount on subsequent visits.
 *
 * Strategy:
 *   - Hoist a fixture plugin whose id is `klondike` (already registered in
 *     the real TUTORIALS map with 4 steps), and mock `../games/registry.js`
 *     so PlayPage resolves only this fixture.
 *   - Real `tutorialFor()` / `hasSeenTutorial()` / `markTutorialSeen()` run
 *     against jsdom's localStorage so the persistence branch is exercised
 *     end-to-end without stubbing the tutorials module.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  // Reuse the real TUTORIALS key so tutorialFor() returns non-empty steps
  // without mocking the tutorials module. Any of klondike / freecell /
  // spider / wordle-mini etc would work — klondike has 4 steps.
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin reusing the klondike id for tutorial coverage.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage per-game tutorial coachmark (W696)", () => {
  it("auto-mounts the Tutorial overlay for a plugin id with registered steps, then suppresses it on remount after dismiss", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // First mount: localStorage is clean → tutorial should auto-launch
    // once we enter the playing phase.
    const { unmount } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen. The auto-launch effect is gated on
    // phase === "playing", so the overlay must not exist before Start.
    expect(screen.queryByTestId("tutorial-tooltip")).toBeNull();
    fireEvent.click(screen.getByTestId("start-game"));

    // Tutorial overlay is mounted: tooltip + step counter + Skip/Next.
    const tooltip = screen.getByTestId("tutorial-tooltip");
    expect(tooltip).toBeTruthy();
    // Step counter shows "1 / N" — N is the registered step count for the
    // klondike id (currently 4). We assert the "1 /" prefix to keep the
    // test resilient to step-count tweaks while still confirming the
    // overlay rendered the per-game step list.
    expect(tooltip.textContent ?? "").toContain("1 /");
    // Dialog is announced as a tutorial.
    expect(screen.getByRole("dialog", { name: /tutorial/i })).toBeTruthy();

    // Dismiss via Skip — onSkip in PlayPage flips the open flag AND calls
    // markTutorialSeen(plugin.id) so the seen-map persists.
    const skipBtn = Array.from(tooltip.querySelectorAll("button")).find(
      (b) => b.textContent?.trim().toLowerCase() === "skip",
    );
    expect(skipBtn).toBeTruthy();
    fireEvent.click(skipBtn!);
    expect(screen.queryByTestId("tutorial-tooltip")).toBeNull();

    // The seen-map should now contain the plugin id.
    const raw = localStorage.getItem("cards-tutorial-seen");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({ [hoisted.TEST_GAME_ID]: true });

    // Remount the page from scratch — the gating effect reads
    // hasSeenTutorial(plugin.id) which is now true, so the overlay must
    // NOT re-appear even after we transition into the playing phase.
    unmount();
    cleanup();

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.queryByTestId("tutorial-tooltip")).toBeNull();
  });
});

void React;
