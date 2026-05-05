/**
 * Unit test for the PlayPage win-banner title's HTML element tag (W1701).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2666) renders the win-banner title as an <h2>:
 *
 *     <h2 className="win-banner-title">You won!</h2>
 *
 *   The `<h2>` element is the document-level heading for the win-modal
 *   dialog — its tag name (not just its className/text) carries the
 *   heading-level semantics that screen-readers and reading-mode tools
 *   rely on for outline navigation. Sibling tests pin its container
 *   testid + literal text via `getByRole("heading", { level: 2, name:
 *   "You won!" })` (W winBannerText), but no test scopes the assertion
 *   to the `.win-banner-title` element itself and pins its tagName. A
 *   regression that swapped the tag for `<div role="heading"
 *   aria-level="2">`, `<p>`, or `<h3>` (e.g. an over-eager styling
 *   refactor) could silently strip the native heading semantics from
 *   the win-modal — the role-based query above would still match a
 *   div-with-role substitute, leaving AT users with a non-`<h2>`
 *   heading element that breaks reading-mode outline tools that key off
 *   the actual element tag rather than the ARIA role.
 *
 * Strategy:
 *   Mirror the W1691 hoisted-fixture pattern (single-dispatch terminal-win
 *   reducer, hoisted plugin, registry mock, confetti null-stub) so this
 *   test pins the same modal-mount transition as its win-path siblings.
 *   After the banner mounts, assert the `.win-banner-title` element's
 *   tagName is exactly "H2". One attribute, one render — distinct from
 *   the role/text pin already in place.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: reducer flips to a `{ score: 1 }` terminal on a single
// dispatched WIN action — the canonical winning-terminal shape that drives
// PlayPage straight into the showWinBanner=true branch which mounts the
// win-banner-headline (and its <h2 class="win-banner-title">).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "win-banner-title-tag-fixture";
  type State = { won: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Win Banner Title Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for win-banner title tagName assertion.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: 1 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-win"
          onClick={() => dispatch({ type: "WIN" })}
        >
          win
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// terminal render side-effect-free. (The win path *does* trigger confetti,
// so the stub is load-bearing here, not just defensive.)
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

describe("PlayPage win banner: .win-banner-title is rendered as an <h2> heading element (W1701)", () => {
  it("renders the win-banner title with tagName === 'H2' while the win banner is on-screen", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's win button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-win (score === 1). One click is enough
    // — the fixture's isTerminal flips to `{ score: 1 }` on the first
    // dispatched WIN, mounting the win banner and its <h2> title.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-win"));
    });

    // Sanity: end-panel mounted in the win branch (data-win="true").
    // Without this guard, a tagName check could pass for the wrong reason
    // (e.g. some unrelated <h2> that happens to share the className).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("true");

    // The contract pin: the `.win-banner-title` element is specifically an
    // <h2> — the heading-level the source writes in the JSX (`<h2
    // className="win-banner-title">You won!</h2>`). Sibling tests pin the
    // role/level/text via getByRole; this is the heading-semantics
    // contract that keeps the win-modal's title navigable as a native
    // heading element rather than a div-with-aria substitute.
    const winBanner = screen.getByTestId("win-banner");
    const title = winBanner.querySelector(".win-banner-title");
    expect(title).toBeTruthy();
    expect(title!.tagName).toBe("H2");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
