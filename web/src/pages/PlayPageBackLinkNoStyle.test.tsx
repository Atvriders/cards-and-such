/**
 * Unit test for the PlayPage header back-to-lobby link style-attribute absence
 * (W2154).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2205) renders the always-on header recovery hatch:
 *     <Link to="/" className="play-backbtn" title="Back to lobby"
 *           aria-label="Back to lobby">
 *       <svg ...>...</svg>
 *       <span>{t("nav.lobby")}</span>
 *     </Link>
 *   The link's visual presentation comes purely from its `play-backbtn`
 *   stylesheet hook — it carries NO inline `style` attribute.
 *
 *   Existing PlayPage back-link tests cover:
 *     - exact className "play-backbtn"             (W1920, PlayPageBackLinkClass)
 *     - native `title` "Back to lobby"             (W1386, PlayPage.headerBackLinkTitle)
 *     - inner SVG aria-hidden contract             (W1185, PlayPageBackBtnGlyphAriaHidden)
 *     - inner SVG focusable="false" contract       (PlayPageBackBtnGlyphFocusable)
 *     - DOM `id` attribute absence                 (W2051, PlayPageBackLinkNoId)
 *   but NONE pin the absence of an inline `style` attribute on the link
 *   itself. That gap means an accidental `style="..."` graft (e.g. an
 *   inline color tweak or a one-off margin override) could silently land
 *   and bypass the stylesheet — defeating themeability and any
 *   user-stylesheet overrides that rely on the className being the sole
 *   styling surface.
 *
 * This test pins the load-bearing fact: the `.play-backbtn` link has NO
 * inline `style` attribute — `link.hasAttribute("style") === false`.
 * `hasAttribute("style")` returns true for any string value (including
 * the empty string), so this catches every shape of accidental style
 * graft, not just non-empty ones.
 *
 * Strategy mirrors PlayPageBackLinkNoId.test.tsx (W2051):
 *   - Hoisted fixture plugin via vi.hoisted so the vi.mock factory captures it.
 *   - Mount at `/play/:gameId` — the back link is rendered in every phase,
 *     so no need to click `start-game`.
 *   - Read the link via container.querySelector(".play-backbtn") (the only
 *     such element on the page) and pin `hasAttribute("style")` to false.
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
  const TEST_GAME_ID = "back-link-no-style-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Back Link No-Style Fixture Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Sentinel description for the W2154 back-link style-absence test.",
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

describe("PlayPage header back-to-lobby link style-attribute absence (W2154)", () => {
  it("renders the .play-backbtn link with no inline style attribute", async () => {
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

    // Pin "no inline style". `hasAttribute("style")` returns true for any
    // string value (including ""), so this catches every shape of accidental
    // style graft — empty, single-property, or full-blown override.
    expect(link!.hasAttribute("style")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
