/**
 * Unit test for the PlayPage header back-to-lobby link tabindex-attribute
 * absence (W2293).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2205) renders the always-on header recovery hatch:
 *     <Link to="/" className="play-backbtn" title="Back to lobby"
 *           aria-label="Back to lobby">
 *       <svg ...>...</svg>
 *       <span>{t("nav.lobby")}</span>
 *     </Link>
 *   The link relies on its native anchor tab order — it carries no
 *   `tabindex` attribute. Native anchors are focusable by default, so any
 *   accidental `tabindex="-1"` would silently remove the recovery hatch
 *   from keyboard navigation, and any positive `tabindex` would fracture
 *   the natural tab order on the play page header.
 *
 *   Existing PlayPage back-link tests cover:
 *     - exact className "play-backbtn"             (W1920, PlayPageBackLinkClass)
 *     - native `title` "Back to lobby"             (W1386, PlayPage.headerBackLinkTitle)
 *     - inner SVG aria-hidden contract             (W1185, PlayPageBackBtnGlyphAriaHidden)
 *     - inner SVG focusable="false" contract       (PlayPageBackBtnGlyphFocusable)
 *     - DOM `id` attribute absence                 (W2051, PlayPageBackLinkNoId)
 *     - inline `style` attribute absence           (PlayPageBackLinkNoStyle)
 *   but NONE pin the absence of `tabindex` on the link itself. That gap
 *   means an accidental `tabindex={-1}` (or any other tabindex graft) could
 *   silently land on the link, breaking keyboard reachability of the
 *   always-on recovery hatch without any test failing.
 *
 * This test pins the load-bearing fact: the `.play-backbtn` link has NO
 * `tabindex` attribute — `link.hasAttribute("tabindex") === false`.
 * `hasAttribute` returns true for any string value (including ""), so this
 * catches every shape of accidental tabindex graft, not just specific
 * numeric values.
 *
 * Strategy mirrors PlayPageBackLinkNoId.test.tsx (W2051):
 *   - Hoisted fixture plugin via vi.hoisted so the vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the back link is rendered in every phase,
 *     so no need to click `start-game`.
 *   - Read the link via container.querySelector(".play-backbtn") (the only
 *     such element on the page) and pin `hasAttribute("tabindex")` to false.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — minimal valid plugin so the registry lookup succeeds
// and PlayPage renders the header (which includes the back link in every
// phase, including the initial setup screen).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "back-link-no-tabindex-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Back Link No-Tabindex Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Sentinel description for the W2293 back-link tabindex-absence test.",
    settings: {} as Record<string, never>,
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

describe("PlayPage header back-to-lobby link tabindex-attribute absence (W2293)", () => {
  it("renders the .play-backbtn link with no tabindex attribute", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor by the stable class — the header back link is the only
    // `.play-backbtn` element on the page.
    const link = container.querySelector<HTMLAnchorElement>(".play-backbtn");

    // Sanity: link must exist. A regression that removed/renamed the class
    // would surface here as a null link.
    expect(link).not.toBeNull();

    // Pin "no tabindex". `hasAttribute("tabindex")` returns true for any
    // string value (including ""), so this catches every shape of accidental
    // tabindex graft — empty, "-1", "0", or any positive integer.
    expect(link!.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
