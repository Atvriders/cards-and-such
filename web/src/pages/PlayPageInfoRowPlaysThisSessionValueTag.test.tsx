/**
 * Unit test for the PlayPage info popover "Plays this session" row VALUE
 * tagName (W2447).
 *
 * The info popover renders three label/value rows:
 *   <div class="play-info-popover-row">
 *     <span class="play-info-label">Plays this session</span>
 *     <span>{sessionPlays}</span>
 *   </div>
 *
 * Coverage for adjacent attributes already exists:
 *   - W164  / W593 (PlayPage.infoSessionCounter): asserts the COUNTER VALUE
 *     reflects sessionPlays correctly (numeric textContent), but does NOT
 *     pin the wrapping element's tagName.
 *   - W1382 (PlayPageInfoRowStartedValueTag): pins tagName === "SPAN" for
 *     the Started row's value sibling.
 *   - W1355 (PlayPageInfoPopoverSeedValueCodeTag): pins tagName === "CODE"
 *     for the Seed row's value sibling (the only row that is NOT a span).
 *   - W1064 (PlayPage.infoPopoverSeedLabel) / W1469 / W1673: pin the Seed
 *     label structural pairing, className, and tagName respectively.
 *
 * Uncovered: the "Plays this session" row VALUE sibling's tagName. The
 * row's value is rendered as a plain `<span>` — distinct from the Seed
 * row's `<code>` semantic contract. A regression that swapped the value
 * to a `<code>`, `<div>`, or any block element would silently shift the
 * row's flex layout and a11y semantics without any existing test failing
 * (the infoSessionCounter test only inspects textContent). This test pins
 * `tagName === "SPAN"` for the Plays-this-session row's value sibling and
 * verifies the row's structural pairing (label + value inside the
 * `.play-info-popover-row` wrapper).
 *
 * Strategy mirrors PlayPageInfoRowStartedValueTag.test.tsx (W1382):
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` to enter the
 *     playing phase, open the popover via `play-info-btn`, walk the
 *     popover's `.play-info-label` spans to find the one whose textContent
 *     is "Plays this session", grab its `nextElementSibling`, and assert
 *     tagName === "SPAN".
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
  const TEST_GAME_ID = "info-popover-plays-this-session-value-tag-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Plays-this-session Value Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for info popover Plays-this-session value tag tests.",
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

describe("PlayPage info popover Plays-this-session row value tagName (W2447)", () => {
  it("renders the Plays-this-session value inside a <span> element (not <code>)", async () => {
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

    // Locate the Plays-this-session label among the popover's
    // `.play-info-label` spans.
    const labels = popover.querySelectorAll(".play-info-label");
    let playsLabel: Element | null = null;
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === "Plays this session") {
        playsLabel = label;
        break;
      }
    }
    expect(playsLabel).not.toBeNull();

    // The value sibling is a plain `<span>` — distinct from the Seed row's
    // `<code>` contract. Pinning the tagName here protects the row's flex
    // layout and a11y semantics from a silent element swap.
    const valueSibling = playsLabel?.nextElementSibling as HTMLElement | null;
    expect(valueSibling).not.toBeNull();
    expect(valueSibling!.tagName).toBe("SPAN");

    // Sanity: the row wrapper holds both the label and the value sibling,
    // anchoring the tagName assertion to the actual Plays-this-session row.
    const row = playsLabel?.closest(".play-info-popover-row");
    expect(row).not.toBeNull();
    expect(row?.contains(valueSibling as Element)).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
