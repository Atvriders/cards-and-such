/**
 * Unit test for the PlayPage overflow ("more actions") menu content (W1037).
 *
 * Observable behavior:
 *   PlayPage.tsx (~lines 2079-2204) renders a `play-toolbar-secondary`
 *   wrapper (`role="menu"`) that holds the lower-frequency mobile actions:
 *   share-seed, help, settings, setup, and fullscreen. On phones this
 *   group is hidden behind the ••• overflow button (W1016) and revealed
 *   when `overflowOpen` flips to `true` (carried as
 *   `data-overflow-open="true"` for the CSS rule).
 *
 *   W1016 already pins the *toggle* contract (aria-expanded +
 *   data-overflow-open both flip on click). What W1016 deliberately did
 *   NOT cover is *what is inside* the menu once it is opened — i.e. the
 *   actual list of actions a mobile player can reach via the disclosure.
 *   A regression that emptied the secondary group, gated every entry
 *   behind a wrong predicate, or left the wrapper rendered but childless
 *   would still pass W1016 (the wrapper element + its data attribute
 *   would still toggle).
 *
 *   This test fills that gap by asserting the CONTENT of the secondary
 *   toolbar after the user clicks the overflow button. The four buttons
 *   that are unconditionally present whenever `phase === "playing"` and
 *   that carry a stable testid are:
 *     - share-seed-btn         (always present in playing phase)
 *     - help-btn               (gated by plugin.howToPlay OR tutorialSteps;
 *                               the fixture supplies howToPlay so it renders)
 *     - play-settings-btn      (gated by Object.keys(settings).length > 0;
 *                               the fixture supplies one settings entry)
 *     - play-fullscreen-btn    (always present in playing phase)
 *
 *   We deliberately skip play-friend-btn here because it is gated by
 *   `plugin.players.multiplayer` and is already the focus of multiple
 *   sibling tests; including it would couple this test to multiplayer
 *   wiring and dilute its single-purpose contract.
 *
 * Strategy mirrors PlayPage.overflowBtnToggle.test.tsx (W1016):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic. Unlike W1016's fixture this one supplies
 *     `howToPlay` and a single `settings` entry so the help and
 *     settings buttons are present inside the menu wrapper.
 *   - Mount at `/play/:gameId`, click `start-game` to advance past
 *     the setup screen so the secondary toolbar mounts.
 *   - Click `play-overflow-btn` to open the disclosure (matching how
 *     a mobile player would surface the menu).
 *   - For each expected testid, look it up via the menu wrapper's
 *     `within(...)` scope. Scoping to the wrapper guarantees the
 *     buttons live INSIDE the secondary group rather than coincidentally
 *     elsewhere in the header — a regression that moved any of these
 *     entries out of the overflow menu would fail loudly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "overflow-menu-content-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Overflow Menu Content Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the overflow-menu content test.",
    // howToPlay must be truthy so the help button mounts inside the menu.
    howToPlay: "Press buttons. That is all.",
    // A single settings entry flips Object.keys(settings).length > 0,
    // gating the settings cog button into the menu.
    settings: {
      difficulty: {
        type: "select" as const,
        label: "Difficulty",
        default: "easy",
        options: [
          { value: "easy", label: "Easy" },
          { value: "hard", label: "Hard" },
        ],
      },
    },
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
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

describe("PlayPage overflow menu content (W1037)", () => {
  it("renders share/help/settings/fullscreen buttons inside the secondary toolbar when opened", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance to the playing phase so the secondary toolbar mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the overflow disclosure (this is the same gesture a mobile
    // player would use). W1016 already pins the toggle behavior; here
    // we treat the click purely as setup so we can read the menu's
    // *contents*.
    fireEvent.click(screen.getByTestId("play-overflow-btn"));

    // Scope every assertion to the secondary toolbar wrapper. This
    // guarantees each button lives INSIDE the overflow menu, not
    // somewhere else in the header that happens to share the testid.
    const menu = screen.getByTestId("play-toolbar-secondary");
    const inside = within(menu);

    // Each of these buttons is the user-facing payload of the overflow
    // menu — losing any of them silently strands mobile players.
    expect(inside.getByTestId("share-seed-btn")).toBeTruthy();
    expect(inside.getByTestId("help-btn")).toBeTruthy();
    expect(inside.getByTestId("play-settings-btn")).toBeTruthy();
    expect(inside.getByTestId("play-fullscreen-btn")).toBeTruthy();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
