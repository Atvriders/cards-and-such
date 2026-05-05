/**
 * Unit test for the PlayPage header back-to-lobby link id-attribute absence
 * (W2051).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2205) renders the always-on header recovery hatch:
 *     <Link to="/" className="play-backbtn" title="Back to lobby"
 *           aria-label="Back to lobby">
 *       <svg ...>...</svg>
 *       <span>{t("nav.lobby")}</span>
 *     </Link>
 *   The link is identified for CSS / e2e / analytics via the `play-backbtn`
 *   className plus its `aria-label` and `title` — NOT via a DOM `id`.
 *   The element deliberately carries no `id` attribute.
 *
 *   Existing PlayPage back-link tests cover:
 *     - exact className "play-backbtn"             (W1920, PlayPageBackLinkClass)
 *     - native `title` "Back to lobby"             (W1386, PlayPage.headerBackLinkTitle)
 *     - inner SVG aria-hidden contract             (W1185, PlayPageBackBtnGlyphAriaHidden)
 *     - inner SVG focusable="false" contract       (PlayPageBackBtnGlyphFocusable)
 *   but NONE pin the absence of `id` on the link itself. That gap means an
 *   accidental `id="back-to-lobby"` (or any stylesheet-driven id graft) could
 *   silently land on the link, expanding the public DOM contract and breaking
 *   anyone who currently relies on it being identified purely by className +
 *   aria-label.
 *
 * This test pins the load-bearing fact: the `.play-backbtn` link has NO `id`
 * attribute — `link.hasAttribute("id") === false`. `hasAttribute` returns
 * true for any string id (including the empty string), so this catches
 * every shape of accidental id graft, not just non-empty ones.
 *
 * Strategy mirrors PlayPageRootNoId.test.tsx (W2020) and PlayPageBackLinkClass
 * (W1920):
 *   - Hoisted fixture plugin via vi.hoisted so the vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the back link is rendered in every phase,
 *     so no need to click `start-game`.
 *   - Read the link via container.querySelector(".play-backbtn") (the only
 *     such element on the page) and pin `hasAttribute("id")` to false.
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
  const TEST_GAME_ID = "back-link-no-id-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Back Link No-Id Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Sentinel description for the W2051 back-link id-absence test.",
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

describe("PlayPage header back-to-lobby link id-attribute absence (W2051)", () => {
  it("renders the .play-backbtn link with no id attribute", async () => {
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

    // Pin "no id". `hasAttribute("id")` returns true for any string value
    // (including ""), so this catches every shape of accidental id graft —
    // empty, slug-derived, or hard-coded.
    expect(link!.hasAttribute("id")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
