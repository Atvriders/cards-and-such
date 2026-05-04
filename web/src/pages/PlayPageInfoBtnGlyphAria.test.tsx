/**
 * Unit test for the PlayPage info button inner-glyph aria-hidden contract
 * (W1279 — symmetric coverage matching W923 (redo-glyph) and W1261
 * (undo-glyph) which pinned analogous wrappers on the redo and undo
 * buttons but left the *info* button's `<span aria-hidden="true">i</span>`
 * wrapper unpinned).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1685) renders the info button's lowercase 'i'
 *   glyph wrapped in a dedicated `<span aria-hidden="true">` so screen
 *   readers do NOT announce the decorative letter alongside the button's
 *   `aria-label="Session info"`. Without `aria-hidden="true"` AT would
 *   double-announce the glyph as the literal letter "i", polluting the
 *   otherwise clean "Session info" label and adding noise that could be
 *   misheard as part of the spoken word ("Session info I").
 *
 *   Sibling tests cover other facets of the same button but none of them
 *   query the inner glyph span:
 *     - W900 (headerInfoButton) pins tagName / type / aria-label /
 *       aria-haspopup / textContent.trim() === "i" — but textContent
 *       collapses regardless of nesting, so dropping the wrapper (or
 *       flipping its aria-hidden to "false") would still pass W900.
 *     - headerInfoTitle / headerInfoKeyshortcuts / headerInfoAriaExpanded
 *       check title / aria-keyshortcuts / aria-expanded — none of them
 *       inspect descendants of the button.
 *     - infoPopover* tests target the popover that opens on click, not
 *       the trigger's inner DOM.
 *
 * Strategy mirrors W1261's undo-glyph assertion — single focused
 * attribute pin via `querySelector("span[aria-hidden='true']")` plus a
 * textContent trim check confirming the matched span really is the
 * glyph wrapper:
 *   - Hoisted minimal fixture so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`. The info button mounts in every phase
 *     (setup / playing / ended), so no game start is needed.
 *   - Locate the info button via testid; assert its descendant
 *     `span[aria-hidden='true']` exists and wraps the 'i' glyph.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-btn-glyph-aria-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Btn Glyph Aria Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the info-button inner-glyph aria-hidden test.",
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
// render side-effect-free.
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

describe("PlayPage info button inner-glyph aria-hidden contract (W1279)", () => {
  it("wraps the 'i' glyph in a <span aria-hidden='true'> so screen readers don't double-announce the decorative letter alongside the button's aria-label", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("play-info-btn") as HTMLButtonElement;

    // a11y contract — the decorative 'i' glyph MUST live inside a wrapper
    // span carrying aria-hidden="true" so AT skips it and reads only the
    // button's aria-label ("Session info"). Drift that flips this to
    // aria-hidden="false", drops the attribute, or hoists the glyph
    // directly onto the button (no wrapper) would make AT announce the
    // letter alongside the label ("Session info I") — invisible to W900
    // which only checks textContent, which collapses regardless of nesting.
    const glyphSpan = btn.querySelector("span[aria-hidden='true']");
    expect(glyphSpan).not.toBeNull();
    expect(glyphSpan?.textContent?.trim()).toBe("i");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
