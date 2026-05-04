/**
 * Unit test for the PlayPage header seed-pick button `aria-haspopup` (W1245).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1850) renders the seed-pick toolbar button with
 *   `aria-haspopup="dialog"`. That attribute is the screen-reader-side
 *   half of the popover-disclosure contract: it tells AT users that
 *   activating the button opens a modal-style dialog (rendered with
 *   `role="dialog"` / `aria-label="Pick seed"`, pinned by W991 in
 *   PlayPage.seedPickPopover.test.tsx).
 *
 *   Sibling tests cover other facets of the same button:
 *     - PlayPage.headerSeedPickButton.test.tsx (W976) — tagName/type/
 *       aria-label/data-tooltip — does NOT exercise aria-haspopup.
 *     - PlayPage.headerSeedPickTitle.test.tsx — title attribute.
 *     - PlayPage.headerSeedPickKeyshortcuts.test.tsx — aria-keyshortcuts.
 *     - PlayPage.headerSeedPickTooltip.test.tsx — data-tooltip.
 *     - PlayPage.seedPickPopover.test.tsx (W991) — the dialog *target*
 *       side, not the trigger's haspopup advertisement.
 *
 *   What none of those pin is the `aria-haspopup="dialog"` advertisement
 *   on the trigger. A regression that dropped it (or set it to "menu" /
 *   "true" / "listbox") would silently mislead screen readers about
 *   what activating the button opens, while every existing assertion
 *   continued to pass.
 *
 * Strategy mirrors PlayPage.headerSeedPickButton.test.tsx (W976):
 *   - vi.hoisted defines a klondike fixture so the seed-pick toolbar
 *     branch (gated by `showProminentSeed` to klondike/freecell/spider)
 *     renders, matching the documented seed-display UX context.
 *   - Pre-seed `cards-tutorial-seen` so the first-run coachmark doesn't
 *     intercept focus/clicks before we read the attribute.
 *   - Mount at `/play/:gameId?seed=42`, advance past setup, locate the
 *     button via its testid, and pin `aria-haspopup === "dialog"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate. The
// fixture plugin uses id "klondike" so the seed-pick toolbar branch (gated
// to klondike/freecell/spider via `showProminentSeed`) renders.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (seed-pick haspopup fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick haspopup attribute test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number): State => ({ seed }),
    reducer: (s: State): State => s,
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
  // Pre-mark the klondike tutorial as seen so the first-run coachmark
  // doesn't intercept the button before we can inspect it.
  localStorage.setItem(
    "cards-tutorial-seen",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: true }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header seed-pick button aria-haspopup (W1245)", () => {
  it("advertises aria-haspopup='dialog' so AT announces the popover semantics", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Seed-pick button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-seed-pick-btn");

    // Disclosure-popover contract — the trigger MUST advertise
    // `aria-haspopup="dialog"` so screen readers announce that
    // activating it opens a modal dialog (the `role="dialog"`
    // popover at `play-seed-picker`, pinned by W991). Setting this
    // to "menu", "true", or omitting it would silently mislead AT
    // about the popover semantics while every other assertion on
    // the button (label, tooltip, type) continued to pass.
    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
