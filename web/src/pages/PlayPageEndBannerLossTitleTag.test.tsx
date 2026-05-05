/**
 * Unit test for the PlayPage loss-banner title's HTML element tag (W1691).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2676) renders the loss-banner title as an <h2>:
 *
 *     <h2 className="loss-banner-title">{t("hud.game_over")}</h2>
 *
 *   The `<h2>` element is the document-level heading for the loss-modal
 *   dialog — its tag name (not just its className/text) carries the
 *   heading-level semantics that screen-readers and reading-mode tools
 *   rely on for outline navigation. Sibling tests pin its className
 *   (W lossEscEndStats — `expect(title.className).toMatch(/loss-banner-title/)`)
 *   and its text content ("Game over" — W lossBannerEncouragement) but
 *   none assert that the element is specifically an `<h2>`. A regression
 *   that swapped the tag for `<div>`, `<p>`, or `<h3>` (e.g. an over-eager
 *   styling refactor) would silently strip the heading semantics from the
 *   loss-modal — every existing className/text assertion would still
 *   pass, leaving AT users with a styled non-heading.
 *
 * Strategy:
 *   Mirror the W863 hoisted-fixture pattern (single-dispatch terminal-loss
 *   reducer, hoisted plugin, registry mock, confetti null-stub) so this
 *   test pins the same modal-mount transition as its loss-path siblings.
 *   After the banner mounts, assert the `.loss-banner-title` element's
 *   tagName is exactly "H2". One attribute, one render — distinct from
 *   the className/text pins already in place.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape that drives
// PlayPage straight into the showLossBanner=true branch which mounts the
// loss-banner-headline (and its <h2 class="loss-banner-title">).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-title-tag-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Title Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner title tagName assertion.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ lost: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "LOSE" ? { lost: true } : s,
    isTerminal: (s: State) => (s.lost ? { score: 0 } : null),
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-lose"
          onClick={() => dispatch({ type: "LOSE" })}
        >
          lose
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
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss banner: .loss-banner-title is rendered as an <h2> heading element (W1691)", () => {
  it("renders the loss-banner title with tagName === 'H2' while the loss banner is on-screen", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0). One click is enough
    // — the fixture's isTerminal flips to `{ score: 0 }` on the first
    // dispatched LOSE, mounting the loss banner and its <h2> title.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: end-panel mounted in the loss branch (data-win="false").
    // Without this guard, a tagName check could pass for the wrong reason
    // (e.g. some unrelated <h2> that happens to share the className).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // The contract pin: the `.loss-banner-title` element is specifically an
    // <h2> — the heading-level the source writes in the JSX (`<h2
    // className="loss-banner-title">{t("hud.game_over")}</h2>`). Sibling
    // tests pin the className and the text; this is the heading-semantics
    // contract that keeps the loss-modal's title navigable as a heading.
    const lossBanner = screen.getByTestId("end-banner-loss");
    const title = lossBanner.querySelector(".loss-banner-title");
    expect(title).toBeTruthy();
    expect(title!.tagName).toBe("H2");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
