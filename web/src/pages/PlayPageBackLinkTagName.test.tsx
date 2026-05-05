/**
 * Unit test for the PlayPage header back-to-lobby link element-tag contract
 * (W2366).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2205) renders the header recovery hatch as
 *   `<Link to="/" className="play-backbtn" title="Back to lobby"
 *          aria-label="Back to lobby">` which react-router-dom resolves to
 *   a real `<a>` anchor element. The anchor tag is what makes the link
 *   middle-clickable (open in new tab), command-clickable, right-click
 *   "Copy link", and crawlable — none of which apply to a `<button>` or
 *   `<div role="link">`. It also matters for screen reader role
 *   inference (`role=link` is implicit on `<a>` only when `href` is
 *   present, which the rendered anchor satisfies).
 *
 *   A regression that swapped the `<Link>` for a `<button onClick>` (a
 *   common refactor to centralize navigation through programmatic
 *   `useNavigate`) would silently break all of those affordances while
 *   still passing className/title/aria-label tests, because none of
 *   those tests inspect the underlying tagName.
 *
 *   Sibling tests pin the className (W1920), the native `title` (W1386),
 *   the absence of `id` / inline `style` / `tabindex` overrides (W1949,
 *   W1950, W1951), and the inner glyph attributes (W1185 et al.), but
 *   none assert the rendered tag itself. The unknownGame fallback test
 *   pins a *different* "Back to lobby" link inside the not-found render
 *   path (separate code site at line 485) so its assertions don't
 *   protect this header link.
 *
 * Strategy mirrors W1920 (PlayPageBackLinkClass.test.tsx) — mount with
 * a minimal hoisted plugin, target the back link by its stable
 * `play-backbtn` class as an existence anchor, then assert exact-string
 * equality of `tagName` against the canonical uppercase DOM value `"A"`.
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
  const TEST_GAME_ID = "header-back-link-tagname-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Back Link TagName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header back-to-lobby link tagName test.",
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

describe("PlayPage header back-to-lobby link tagName contract (W2366)", () => {
  it("renders the .play-backbtn element as an <a> anchor (tagName === 'A') so middle-click, copy-link, and implicit link role all work", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Anchor by the stable class so the assertion is unambiguous about
    // which element is being pinned. The header back link is the only
    // `.play-backbtn` on the page during the setup phase that this
    // fixture lands in.
    const back = container.querySelector(".play-backbtn");
    expect(back).not.toBeNull();

    // tagName is canonically uppercase in HTML documents per the DOM
    // spec, so a literal "A" comparison is portable across jsdom and
    // real browsers. Asserting both equality forms guards against any
    // future helper that might lowercase the value before returning.
    expect(back!.tagName).toBe("A");
    expect(back!.tagName === "A").toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
