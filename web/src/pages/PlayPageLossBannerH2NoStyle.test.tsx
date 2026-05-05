/**
 * Unit test for the PlayPage loss-banner <h2>'s `style` attribute absence
 * (W2145).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2676) renders the loss-banner title as a bare <h2>:
 *
 *     <h2 className="loss-banner-title">{t("hud.game_over")}</h2>
 *
 *   The element carries ONLY a `className` — no `style` prop. All visual
 *   styling for the heading flows through the `.loss-banner-title` class
 *   hook in PlayPage.css — never via an inline `style={{ … }}` prop.
 *   Adding an inline style would silently override the stylesheet's
 *   cascade, defeat user-facing theme overrides, and split the styling
 *   contract across two surfaces (CSS file + JSX literal).
 *
 * Existing coverage gap:
 *   - PlayPageEndBannerLossTitleTag (W1691) — pins tagName === "H2"
 *   - PlayPageEndBannerLossHeadlineClass — pins the wrapper <div> className
 *   - PlayPageLossBannerNoStyle (W2121) — pins `style` absence on the
 *     wrapper `<div data-testid="end-banner-loss">`, NOT on the inner <h2>.
 *   - PlayPageLossBannerH2NoId (W2095) — pins `id` absence on the inner <h2>.
 *   None pin the `style` attribute on the `<h2 class="loss-banner-title">`
 *   itself. That gap means an accidental `style={{ … }}` prop on the
 *   heading could land silently. This test fills the gap with the smallest
 *   possible pin: locate the title via `.loss-banner-title` and assert
 *   `title.hasAttribute("style") === false`. `hasAttribute` returns true
 *   for any string value (including ""), so the assertion fails loudly the
 *   moment the heading grows any kind of inline style.
 *
 * Strategy:
 *   Mirror the W2095 hoisted-fixture pattern (single-dispatch terminal-loss
 *   reducer, hoisted plugin, registry mock, confetti null-stub) so this
 *   test pins the same modal-mount transition as its loss-path siblings.
 *   - Hoisted fixture lets the reducer/plugin reference live before the
 *     vi.mock factory runs.
 *   - GAMES registry mock returns ONLY the fixture so PlayPage's gameId
 *     lookup resolves to the loss-driving plugin.
 *   - Confetti null-stub avoids canvas APIs jsdom doesn't ship.
 *   - Drive playing → ended-loss in two clicks (start, then the fixture's
 *     lose button), locate the heading via `.loss-banner-title`, and
 *     assert `hasAttribute("style")` is false on that node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture: reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape that drives
// PlayPage straight into the showLossBanner=true branch which mounts the
// loss-banner-headline wrapper and its <h2 class="loss-banner-title">.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-h2-no-style-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner H2 No-Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the loss-banner <h2> style-attribute absence test.",
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

describe("PlayPage loss-banner <h2> style-attribute absence (W2145)", () => {
  it("renders the loss-banner title <h2> with no inline style attribute", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the loss banner is NOT mounted before the round
    // terminates — it lives behind the
    // `phase === "ended" && finalScore !== null` render gate plus the
    // !isWin branch.
    expect(screen.queryByTestId("end-banner-loss")).toBeNull();

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0). One click is
    // enough — the fixture's isTerminal flips to `{ score: 0 }` on the
    // first dispatched LOSE, mounting the loss banner and its <h2> title.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: end-panel mounted in the loss branch (data-win="false").
    // Without this guard, the style-absence check could pass for the
    // wrong reason (e.g. the heading failed to mount at all).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Locate the loss-banner headline wrapper by testid (the contract
    // pinned elsewhere), then descend to the <h2 class="loss-banner-title">.
    // Scoping under the wrapper isolates exactly the title heading we mean
    // to pin (not, say, an unrelated <h2> elsewhere on the page).
    const lossBanner = screen.getByTestId("end-banner-loss");
    const title = lossBanner.querySelector(".loss-banner-title");
    expect(title).toBeTruthy();
    // Sanity: the located node really is the <h2> we mean to pin.
    expect(title!.tagName).toBe("H2");

    // Pin "no style" on the heading itself. `hasAttribute("style")` returns
    // true for any string value (including ""), so this fails loudly the
    // moment the <h2> grows any kind of inline style.
    expect(title!.hasAttribute("style")).toBe(false);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
