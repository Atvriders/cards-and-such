/**
 * Unit test for the PlayPage info popover "Started" row LABEL tagName
 * (W1683).
 *
 * The info popover renders rows shaped as:
 *   <div class="play-info-popover-row">
 *     <span class="play-info-label">Started</span>
 *     <span>{sessionStart.toLocaleTimeString() | "—"}</span>
 *   </div>
 *
 * Coverage for adjacent attributes already exists:
 *   - W1047 (PlayPage.infoPopoverStartedRow): structural pairing — finds
 *     the row via `.play-info-label` + `nextElementSibling` and asserts
 *     the value text is non-empty.
 *   - W1463 (PlayPageInfoStartedLabelClass): label className === exactly
 *     "play-info-label" (no extra modifier classes).
 *   - W1382 (PlayPageInfoRowStartedValueTag): the value sibling's
 *     tagName === "SPAN" and wrapping row className.
 *
 * Uncovered: the Started row's LABEL element's tagName itself. Existing
 * tests query the label via `.play-info-label` (which only requires the
 * class to be present) and pin the className value, but never assert
 * that the label is rendered as a `<span>` — the structural choice that
 * keeps the row a flow-level pairing of inline label + inline value.
 * If the label were silently swapped to a block element (e.g. `<div>`
 * or `<label>`), the popover row's flex layout and a11y semantics
 * would shift without any existing test catching it. This test pins
 * `tagName === "SPAN"` for the Started-row label.
 *
 * Strategy mirrors W1673 (Seed-row label tagName test):
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` to enter the
 *     playing phase, click `play-info-btn` (popover opens on click), then
 *     locate the Started-row label via `.play-info-label` text-content
 *     match and assert its tagName.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-started-label-tag-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Started Label Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for info popover Started-label tagName tests.",
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

describe("PlayPage info popover Started row label tagName (W1683)", () => {
  it("renders the Started label as a <span> element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase, then open the info popover (click-gated).
    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    const labels = popover.querySelectorAll(".play-info-label");
    let startedLabel: Element | null = null;
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === "Started") {
        startedLabel = label;
        break;
      }
    }
    expect(startedLabel).not.toBeNull();

    // Pin the label's tagName — sibling tests cover className/text but
    // never the inline-element choice itself.
    expect((startedLabel as HTMLElement).tagName).toBe("SPAN");
  });
});

void React;
