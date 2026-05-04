/**
 * Unit test for the PlayPage info popover Seed-row VALUE TAG (W1355).
 *
 * The info popover's first row pairs a `.play-info-label` span reading
 * "Seed" with a `<code>{seed}</code>` value sibling. The `<code>` tagName
 * is a load-bearing semantic contract: it differentiates the seed value
 * from a regular `<span>` (the "Started" / "Plays this session" rows
 * use `<span>`), enables the monospace style hook, and signals to AT
 * users that the content is verbatim machine-readable identifier.
 *
 * Coverage gap:
 *   - W164  (PlayPage.infoSeedShown) asserts the seed VALUE textContent
 *     ("42" given URL ?seed=42) but NOT the wrapping element's tagName.
 *   - W1064 (PlayPage.infoPopoverSeedLabel) asserts the "Seed" label
 *     text and that a sibling value element exists in the same row, but
 *     does NOT pin the value sibling's tagName to "CODE".
 *   - W900 (headerInfoButton), W1249 (close className), W1268 (how-to-play
 *     link), W1330 (action-log summary class), and W1047 (started-row)
 *     all touch unrelated info-popover elements.
 *
 * A regression that swapped `<code>` for a plain `<span>` (or any other
 * tag) would silently break the monospace seed-value contract without
 * any existing test failing. This test pins that tagName.
 *
 * Strategy mirrors PlayPage.infoPopoverSeedLabel.test.tsx:
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage, click `start-game` to enter the playing phase, open
 *     the popover via `play-info-btn`, walk the popover's `.play-info-label`
 *     spans to find the one whose textContent is "Seed", grab its
 *     `nextElementSibling`, and assert tagName === "CODE".
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
  const TEST_GAME_ID = "info-popover-seed-value-code-tag-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Seed Value Code Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Seed-value <code> tag tests.",
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

describe("PlayPage info popover Seed row value tagName (W1355)", () => {
  it("renders the Seed value inside a <code> element (not <span>)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=99`]}>
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
    expect(seedLabel).not.toBeNull();

    // The value sibling is a `<code>` element — pinning the semantic
    // contract that distinguishes it from the surrounding `<span>` values.
    const valueSibling = seedLabel?.nextElementSibling as HTMLElement | null;
    expect(valueSibling).not.toBeNull();
    expect(valueSibling!.tagName).toBe("CODE");

    // Sanity: the <code> element wraps the URL-supplied seed value so the
    // tagName assertion is anchored to the actual seed-value node (not an
    // unrelated <code> that might appear elsewhere in the popover).
    expect(valueSibling!.textContent?.trim()).toBe("99");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
