/**
 * Unit test for the PlayPage info-popover close-button `role` attribute
 * absence (W2356).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1771-1781) renders, inside the open session-info
 *   popover, `<button type="button" class="play-info-close" aria-label=
 *   "Close session info">Close</button>`. The element intentionally does
 *   NOT carry an explicit `role` attribute. A native `<button>` already
 *   has the implicit ARIA role "button"; setting `role="button"` (or any
 *   other role like "menuitem") on it would be redundant at best and an
 *   accessibility regression at worst (e.g. `role="presentation"` would
 *   strip its semantics from assistive tech, breaking the popover dismiss
 *   affordance).
 *
 *   Sibling tests already cover:
 *     - W1868 PlayPageInfoCloseButtonClass: exact className equality.
 *     - W1249 PlayPageInfoPopoverCloseClassName: classList contains.
 *     - W985  PlayPage.infoPopoverCloseAriaLabel: aria-label + text.
 *     - W2052 PlayPageInfoCloseNoId: no `id` attribute.
 *     -       PlayPageInfoCloseNoStyle: no inline `style` attribute.
 *     -       PlayPageInfoCloseNoTabindex: no `tabindex` attribute.
 *     -       PlayPageInfoPopoverCloseType: literal `type="button"` and
 *             tagName "BUTTON".
 *     -       PlayPage.infoPopoverCloseClick: click dismisses popover.
 *
 *   None of them pins the close button's `role` attribute absence, which
 *   is the contract this test fills. A regression that adds
 *   `role="button"` (verbose noise) or `role="menuitem"` /
 *   `role="presentation"` (semantically wrong) would slip past every
 *   existing check.
 *
 * Strategy mirrors the hoisted-fixture pattern used by neighboring
 * info-popover tests:
 *   - Hoisted minimal fixture plugin so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter playing phase.
 *   - Click `play-info-btn` to open the popover.
 *   - Locate close button by accessible name and assert
 *     `hasAttribute("role") === false`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-close-no-role-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Close NoRole Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover close-button no-role test.",
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

describe("PlayPage info popover close button — no role attribute (W2356)", () => {
  it("close button does not carry an explicit `role` attribute", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("fixture-game")).toBeTruthy();

    // Open the popover so the close button mounts on the live surface.
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const popover = screen.getByTestId("play-info-popover");
    expect(popover).toBeTruthy();

    // Disambiguate from sibling close controls via the popover's specific
    // accessible name. `getByRole("button", ...)` matches via implicit
    // role on the native <button>; that is exactly the contract under
    // test — the implicit role suffices, no explicit attribute needed.
    const closeBtn = screen.getByRole("button", { name: "Close session info" });
    expect(closeBtn.className).toBe("play-info-close");

    // The contract under test: no explicit `role` attribute on this
    // element. The implicit ARIA role of a native <button> is already
    // "button"; stamping `role="button"` is redundant, and stamping any
    // other role (e.g. "presentation", "menuitem") would be an a11y
    // regression.
    expect(closeBtn.hasAttribute("role")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
