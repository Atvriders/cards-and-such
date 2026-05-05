/**
 * Unit test for the PlayPage info popover "Plays this session" row LABEL
 * tagName (W2454).
 *
 * The info popover renders rows shaped as:
 *   <div class="play-info-popover-row">
 *     <span class="play-info-label">Plays this session</span>
 *     <span>{sessionPlays}</span>
 *   </div>
 *
 * Coverage for adjacent attributes already exists:
 *   - W164 / W593 (PlayPage.infoSessionCounter): asserts the COUNTER VALUE
 *     reflects sessionPlays correctly (numeric textContent), but only
 *     looks the label up by class+text — never pins its tagName.
 *   - W2447 (PlayPageInfoRowPlaysThisSessionValueTag): pins tagName ===
 *     "SPAN" for the Plays-this-session row's VALUE sibling.
 *   - W1683 (PlayPageInfoStartedLabelTag) and the Seed-row sibling pin the
 *     LABEL tagName for the Started and Seed rows respectively, but no
 *     symmetric test exists for the Plays-this-session row.
 *
 * Uncovered: the Plays-this-session row's LABEL element's tagName. Every
 * existing test that touches this label queries by `.play-info-label`
 * (class only) or by textContent — neither pins the inline-element
 * structural choice. A regression that swapped the label to a `<div>`,
 * `<label>`, or `<dt>` would silently break the popover row's flex
 * layout (label and value share a row via inline siblings) and shift
 * a11y semantics, while every existing test still passed. This test
 * pins `tagName === "SPAN"` for the Plays-this-session label.
 *
 * Strategy mirrors W1683 (PlayPageInfoStartedLabelTag):
 *   - vi.hoisted fixture plugin registered through a mocked GAMES registry.
 *   - Mount PlayPage at /play/:gameId, click `start-game` to enter the
 *     playing phase, click `play-info-btn` (popover opens on click), then
 *     locate the Plays-this-session label via `.play-info-label`
 *     text-content match and assert its tagName.
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
  const TEST_GAME_ID = "info-popover-plays-this-session-label-tag-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Plays-this-session Label Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for info popover Plays-this-session label tagName tests.",
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

describe("PlayPage info popover Plays-this-session row label tagName (W2454)", () => {
  it("renders the Plays-this-session label as a <span> element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter the playing phase, then open the info popover (click-gated).
    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    const labels = popover.querySelectorAll(".play-info-label");
    let playsLabel: Element | null = null;
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === "Plays this session") {
        playsLabel = label;
        break;
      }
    }
    expect(playsLabel).not.toBeNull();

    // Pin the label's tagName — sibling tests cover className/text and the
    // value sibling's tagName, but never the label's own inline-element
    // choice. A swap to <div>/<label>/<dt> would break flex layout and
    // a11y semantics silently.
    expect((playsLabel as HTMLElement).tagName).toBe("SPAN");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
