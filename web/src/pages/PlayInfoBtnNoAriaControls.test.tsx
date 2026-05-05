/**
 * Unit test pinning the ABSENCE of an `aria-controls` attribute on the
 * PlayPage session-info trigger button (W2389).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1674-1686) renders the session-info trigger as
 *     `<button ref={infoButtonRef} type="button" className="play-info-btn"
 *              onClick={...} aria-label="Session info" aria-expanded={infoOpen}
 *              aria-haspopup="dialog" data-testid="play-info-btn"
 *              title="Session info">i</button>`
 *   The trigger advertises disclosure semantics via `aria-haspopup="dialog"`
 *   and `aria-expanded`, but it deliberately does NOT carry an
 *   `aria-controls` attribute. The popover element is rendered conditionally
 *   (`{infoOpen && <div ...>...}`), so a static `aria-controls="..."` would
 *   either dangle when the popover is closed (referencing a non-existent
 *   id), or would force us to assign and pin a stable id on the popover
 *   container — which sibling tests (PlayPageInfoPopoverNoId, W2046) have
 *   explicitly chosen NOT to do. Per WAI-ARIA APG, `aria-controls` is
 *   not required for disclosure widgets when `aria-haspopup` and
 *   `aria-expanded` are present and the controlled element is a sibling
 *   in the same accessibility subtree.
 *
 *   Sibling tests cover OTHER attributes on this same button — class
 *   (PlayPageInfoButtonClass), no-id (PlayPageInfoButtonNoId), no-style
 *   (PlayPageInfoButtonNoStyle), no-tabindex (PlayPageInfoButtonNoTabindex),
 *   the inner glyph aria (PlayPageInfoBtnGlyphAria), aria-expanded
 *   (PlayPage.headerInfoAriaExpanded), aria-keyshortcuts absence
 *   (PlayPage.headerInfoKeyshortcuts), tooltip/title bindings
 *   (PlayPage.headerInfoTitle), tagName/type/aria-label/aria-haspopup
 *   (PlayPage.headerInfoButton) — but NONE assert that the trigger has
 *   NO `aria-controls` attribute. A regression that started emitting
 *   `aria-controls="play-info-popover"` (e.g. while wiring up an a11y
 *   coupling without also pinning a popover id) would silently dangle
 *   when the popover is collapsed and pass every existing test. This
 *   single focused assertion fills that gap.
 *
 *   This is the info-button analog of the W982 absent-aria-controls
 *   contract pinned on the settings button
 *   (PlayPage.headerSettingsAriaControls.test.tsx). Both buttons share
 *   the same conditional-render rationale.
 *
 * Strategy mirrors PlayPageInfoButtonNoTabindex.test.tsx (W2288):
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Find `play-info-btn` and assert
 *     `getAttribute("aria-controls") === null`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-btn-no-aria-controls-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Btn No-Aria-Controls Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-btn no-aria-controls test.",
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

describe("PlayPage info button absent aria-controls contract (W2389)", () => {
  it("does not advertise aria-controls on the info button (popover is conditionally rendered; haspopup+expanded carry disclosure semantics)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the trigger button is mounted on the live
    // playing-phase header — the realistic surface where it lives.
    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Pin the deliberate ABSENCE of aria-controls. The play-info-popover
    // is conditionally rendered (`{infoOpen && <div ...>}`) and carries
    // no stable id (per W2046), so a static aria-controls here would
    // either dangle when collapsed or force a popover-id assignment we
    // have explicitly chosen against. A future a11y refactor that adds
    // `aria-controls="..."` here without also reworking the popover-id
    // policy would fail this assertion and demand a deliberate review.
    const btn = screen.getByTestId("play-info-btn");
    expect(btn.getAttribute("aria-controls")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
