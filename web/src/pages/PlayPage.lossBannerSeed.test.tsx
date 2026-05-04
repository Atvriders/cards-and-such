/**
 * Unit test for PlayPage loss-banner end-seed value (W850).
 *
 * Observable behavior:
 *   When the game reaches a *losing* terminal (`isTerminal` returns
 *   `{ score: 0 }`), PlayPage.tsx (~line 2718) still mounts the shared
 *   `<div class="end-seed" data-testid="end-seed">Seed: <code>{seed}</code>
 *   </div>` inside the end-panel — the seed readout is NOT gated behind
 *   `isWin`, it's part of the always-mounted end-panel body. This is what
 *   lets a player share or reproduce a tough loss the same way they'd
 *   share a win.
 *
 *   Sibling W818 (PlayPage.endSeed.test.tsx) pins the seed value on the
 *   *win* path; sibling W845 (PlayPage.lossBannerEncouragement.test.tsx)
 *   pins the loss-banner headline + encouragement. Neither asserts the
 *   end-seed element on the loss path. A regression that wrapped the
 *   `end-seed` block in `{isWin && ...}` (matching the adjacent best-time
 *   row) — or that wired the loss-banner to a stale, sanitised, or
 *   different seed variable — would silently strip the reproducibility
 *   token from every losing round while every existing test stayed green.
 *
 * Strategy:
 *   Mirror W845's hoisted-fixture pattern (reducer flips to
 *   `isTerminal: { score: 0 }` on a single dispatched action) so PlayPage
 *   walks the loss branch (`isWin === false`, `isLoss === true`,
 *   `showLossBanner === true`). Mount with `?seed=24680` so the
 *   `parseSeed` URL path is exercised. After the loss banner mounts,
 *   assert:
 *     1. The end-panel mounts with `data-win="false"` (loss-side render)
 *        — confirms we really are on the loss branch, otherwise the seed
 *        assertion below could pass for the wrong reason.
 *     2. `end-seed` is mounted with the literal "Seed: 24680" textContent
 *        — exact same render contract W818 pins for the win path, here
 *        verified for the loss path.
 *     3. The inner `<code>` element holds the bare numeric seed —
 *        structural pin matching W818, ensures a regression that
 *        flattened the wrapper still surfaces.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape (mirrors the
// W845 fixture). The exact game id is irrelevant beyond uniqueness; we only
// need PlayPage to render the loss end-panel.
// ---------------------------------------------------------------------------
const URL_SEED = 24680;

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-seed-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Seed Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner end-seed assertion.",
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
// confetti — see W825 — but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss-banner end-seed value (W850)", () => {
  it("renders the URL seed inside end-seed on the loss path (zero-score terminal)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // `?seed=24680` exercises the `parseSeed(searchParams.get("seed"))`
    // path so the seed state initialises from the URL rather than a
    // randomSeed() / readLastSeed() fallback. We deliberately do NOT use
    // `?quickstart=1` to mirror W845's flow (start-game button click).
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=${URL_SEED}`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-seed is NOT mounted before the game ends — it
    // lives inside the `phase === "ended"` end-panel branch.
    expect(screen.queryByTestId("end-seed")).toBeNull();

    // Move past setup → phase === "playing", fixture's lose button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Drive the round into terminal-loss (score === 0).
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // (1) End-panel mounted with data-win="false" — confirms the loss
    // branch is the one driving render. Without this guard, a regression
    // that mistakenly drove the win path could pass the seed assertion
    // below for the wrong reason (W818 already covers the win-path seed).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // (2) end-seed must be mounted on the loss path with the URL seed —
    // this is the contract a regression that wrapped end-seed in
    // `{isWin && ...}` would break. Trimmed textContent matches the
    // source format `Seed: <code>{seed}</code>` exactly.
    const endSeed = screen.getByTestId("end-seed");
    expect(endSeed).toBeTruthy();
    expect(endSeed.textContent?.trim()).toBe(`Seed: ${URL_SEED}`);

    // (3) Structural pin: the inner `<code>` element holds the bare
    // numeric seed string (matches W818's win-path assertion). Catches
    // a regression that flattened the wrapper or wired the value to a
    // sibling text node.
    const codeEl = endSeed.querySelector("code");
    expect(codeEl?.textContent).toBe(String(URL_SEED));
  });
});

// Reference React so the file is unambiguously a JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
