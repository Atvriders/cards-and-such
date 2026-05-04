/**
 * Unit test for the PlayPage info popover "Seed" row LABEL (W1064).
 *
 * The info popover mounts a sequence of rows; the first row pairs a
 * `.play-info-label` span reading "Seed" with a `<code>` element that
 * shows the active seed value.
 *
 * Coverage gap: W164 (PlayPage.infoSeedShown) asserts the seed VALUE
 * displayed in the <code> sibling, and W1047 (PlayPage.infoPopoverStartedRow)
 * asserts the "Started" row's label + timestamp value. Neither test
 * verifies that the Seed row's label TEXT is exactly "Seed" nor that
 * the row container holds both the label and the value sibling — the
 * structural pairing that the row's a11y/visual layout depends on.
 *
 * Strategy mirrors PlayPage.infoPopoverStartedRow.test.tsx:
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` so the playing
 *     phase is entered, open the popover via `play-info-btn`, then locate
 *     the row whose label span is "Seed" and assert (a) the label's text
 *     content is exactly "Seed", and (b) the same row contains both the
 *     label span and a sibling value element (label.nextElementSibling).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — vi.hoisted runs before vi.mock factories evaluate,
// so the closure capture below is safe despite resembling a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-seed-label-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Seed Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Seed-label tests.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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

describe("PlayPage info popover Seed row label (W1064)", () => {
  it("renders a 'Seed' label paired with a value sibling in the popover row", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter the playing phase, then open the info popover.
    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");

    // Locate the Seed label among the popover's `.play-info-label` spans.
    const labels = popover.querySelectorAll(".play-info-label");
    let seedLabel: Element | null = null;
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === "Seed") {
        seedLabel = label;
        break;
      }
    }

    // (a) Label text is exactly "Seed".
    expect(seedLabel).not.toBeNull();
    expect(seedLabel?.textContent?.trim()).toBe("Seed");

    // (b) The row container holds both the label span and a sibling value
    // element — i.e. the row has the label + value structural pairing.
    const row = seedLabel?.closest(".play-info-popover-row");
    expect(row).not.toBeNull();
    expect(row?.contains(seedLabel as Element)).toBe(true);

    const valueSibling = seedLabel?.nextElementSibling;
    expect(valueSibling).not.toBeNull();
    expect(row?.contains(valueSibling as Element)).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
