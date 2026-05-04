/**
 * Unit tests for the post-win inline "Rate this game" rating block (W169).
 *
 * Rendered by `EndRatingBlock` inside the win banner, this widget:
 *   1. Shows the 5-star editor when the user has not rated the game yet
 *   2. Persists a click on a star to `cards-ratings.<gameId>` (the value
 *      lives in the JSON object under the `cards-ratings` localStorage
 *      key, which `readRating(gameId)` reads back as a number)
 *   3. After a rating is set, shrinks to a read-only display with an
 *      "Update" button — clicking it pops the editor back into view so
 *      the user can change their rating without losing the prior value
 *
 * The reducer/isTerminal/component triple wired up via `vi.hoisted` lets
 * us drive the page from "setup" → "playing" → "ended" by clicking a
 * single fixture-rendered button. The fixture's `isTerminal` returns a
 * positive score once the win flag is set, which puts PlayPage in the
 * `isWin` state and reveals the rating block.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. The reducer toggles `won` to true on a `WIN`
// action and `isTerminal` reports a winning score (1) once that flag is
// set — that's the minimum needed to drive PlayPage into `phase==="ended"`
// with `finalScore > 0` so the win banner (and the rating block inside)
// renders.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "rating-fixture";
  type State = { won: boolean };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Rating Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Rating-flow test fixture.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: { type: string }): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: 1 } : null),
    component: ({ dispatch }: { dispatch: (a: { type: string }) => void }) => (
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

// PlayPage looks the plugin up via the games registry, so substitute our
// fixture as the only entry. Keeping a single plugin keeps the lobby /
// info popovers from pulling in unrelated plugin code paths during the
// test render.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs we don't need to exercise here; stubbing
// it out keeps the win-banner render fast and side-effect-free.
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

/**
 * Mounts PlayPage at the fixture game, advances past the setup screen,
 * then dispatches the win action so the page reaches `phase === "ended"`
 * with a positive `finalScore` — i.e. the terminal state where the
 * EndRatingBlock is visible.
 */
async function mountAtWinBanner(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId("start-game"));
  // Trigger the win dispatch — reducer flips `won`, isTerminal reports
  // score 1, PlayPage transitions to "ended" and renders the win banner.
  act(() => {
    fireEvent.click(screen.getByTestId("fixture-win"));
  });
}

describe("PlayPage post-win rating flow (W169)", () => {
  it("renders 5 interactive stars after a win", async () => {
    await mountAtWinBanner();

    // The win banner with its EndRatingBlock should now be on-screen.
    expect(screen.getByTestId("end-rating")).toBeTruthy();
    const stars = screen.getByTestId("end-rating-stars");
    expect(stars).toBeTruthy();
    // All 5 individual star buttons are reachable by their per-index
    // testid — covers both "renders 5 stars" and "they're addressable
    // for click in the next test".
    for (let n = 1; n <= 5; n++) {
      expect(screen.getByTestId(`end-rating-stars-star-${n}`)).toBeTruthy();
    }
    // Until rated, the read-only variant + Update button should not be
    // present — those only appear post-rating.
    expect(screen.queryByTestId("end-rating-stars-readonly")).toBeNull();
    expect(screen.queryByTestId("end-rating-update")).toBeNull();
  });

  it("clicking the 4th star persists rating=4 under cards-ratings.<gameId>", async () => {
    await mountAtWinBanner();

    expect(localStorage.getItem("cards-ratings")).toBeNull();

    act(() => {
      fireEvent.click(screen.getByTestId("end-rating-stars-star-4"));
    });

    // The widget writes a single JSON-object under the `cards-ratings`
    // key with the gameId mapped to the chosen rating. Match the exact
    // shape rather than the raw string so a future migration to a
    // different on-disk encoding doesn't break this assertion for the
    // wrong reason.
    const raw = localStorage.getItem("cards-ratings");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as Record<string, number>;
    expect(parsed[hoisted.TEST_GAME_ID]).toBe(4);
  });

  it("after rating, the Update button reveals the editor again", async () => {
    // Pre-seed an existing rating so EndRatingBlock mounts with
    // `editing=false` and immediately renders the read-only branch +
    // Update button. (After an in-component fresh rate the widget
    // intentionally keeps the editor open so the StarRating's "Saved"
    // toast can play in place — see EndRatingBlock for the rationale —
    // so the read-only path is reached on subsequent visits, not
    // mid-edit.)
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ [hoisted.TEST_GAME_ID]: 4 }),
    );

    await mountAtWinBanner();

    // Read-only display + Update button should be on-screen because
    // PlayPage seeded `rating=4` from localStorage at mount.
    const updateBtn = screen.getByTestId("end-rating-update");
    expect(updateBtn).toBeTruthy();
    expect(screen.getByTestId("end-rating-stars-readonly")).toBeTruthy();
    // The interactive editor variant should NOT be present yet.
    expect(screen.queryByTestId("end-rating-stars")).toBeNull();

    act(() => {
      fireEvent.click(updateBtn);
    });

    // Editor returns: interactive stars come back, Update button is
    // gone, read-only variant is gone.
    expect(screen.getByTestId("end-rating-stars")).toBeTruthy();
    expect(screen.queryByTestId("end-rating-stars-readonly")).toBeNull();
    expect(screen.queryByTestId("end-rating-update")).toBeNull();
  });

  // W821 — re-clicking the already-selected star is the StarRating
  // toggle-off gesture, and PlayPage's `onRate` forwards the resulting
  // 0 straight into `writeRating(plugin.id, 0)`. The localStorage
  // helper deletes the gameId entry on a 0 write rather than storing
  // a literal `0`, so the post-click `cards-ratings` blob should
  // contain an empty object — not a `{ [gameId]: 0 }` entry.
  it("W821 re-clicking the selected star clears the rating from cards-ratings", async () => {
    // Pre-seed rating=4 so PlayPage hydrates `rating` state from disk
    // and renders the read-only display + Update button. (The fresh
    // post-rate flow keeps the editor open mid-toast, but mounting
    // with an existing rating skips that branch — exactly the path
    // we need to exercise re-click clearing on a previously-saved
    // rating, which is what the on-disk lifecycle actually does.)
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ [hoisted.TEST_GAME_ID]: 4 }),
    );

    await mountAtWinBanner();

    // Reveal the interactive editor first — the read-only variant
    // disables its star buttons, so we have to step through Update
    // before the toggle-off click can land.
    act(() => {
      fireEvent.click(screen.getByTestId("end-rating-update"));
    });

    // Click star 4 (the currently-selected one). StarRating treats
    // `onClick` on `value === n` as a clear and fires `onChange(0)`.
    act(() => {
      fireEvent.click(screen.getByTestId("end-rating-stars-star-4"));
    });

    // `writeRating(_, 0)` removes the gameId key from the JSON map
    // rather than writing `0`, so the blob should now be `{}`. We
    // assert the parsed shape rather than the raw string so a future
    // representation change (e.g. removing the empty key entirely)
    // doesn't fail this test for an unrelated reason.
    const raw = localStorage.getItem("cards-ratings");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as Record<string, number>;
    expect(parsed[hoisted.TEST_GAME_ID]).toBeUndefined();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
