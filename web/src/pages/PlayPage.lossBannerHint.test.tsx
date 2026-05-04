/**
 * Unit test for PlayPage loss-banner hint paragraph (W876).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2821) renders, only when `showLossBanner` is true,
 *   a `<p data-testid="loss-banner-hint" class="win-banner-hint
 *   loss-banner-hint">` paragraph below the end-actions that reads:
 *
 *     "Press <kbd>Enter</kbd> to replay, <kbd>Esc</kbd> to dismiss"
 *
 *   This is the loss-path counterpart of the win-banner hint (W840). The
 *   wording differs from the win arm — "to replay" rather than "to play
 *   again" — because the loss flow restarts the same seed (replay) instead
 *   of starting a fresh round. While W840 pins the win arm and W834 covers
 *   the keyboard semantics generally, no existing test pins THIS paragraph:
 *     - that the loss banner emits a `loss-banner-hint` testid at all,
 *     - that the paragraph carries BOTH the `win-banner-hint` (shared
 *       layout) and `loss-banner-hint` (loss-specific override) classes
 *       used by the .css to size/position the hint,
 *     - that the readable text names BOTH the Enter and Esc keys,
 *     - that two `<kbd>` elements wrap those exact key names so the
 *       `.win-banner-hint kbd` CSS rule still produces key-cap styling.
 *
 *   A regression that dropped the `{showLossBanner && <p ...>}` block
 *   during a layout refactor, accidentally bound the hint to
 *   `showWinBanner` only, flattened the markup to plain text, or stripped
 *   one of the key names from the sentence would silently break the
 *   discoverability contract on the loss screen — players who lose a
 *   round would not know that Esc dismisses the modal or Enter replays.
 *   None of the existing PlayPage loss-path test files
 *   (W845/W846/W847/W848/W863/...) pin this paragraph.
 *
 * Strategy:
 *   Mirror W863's hoisted-fixture pattern (single-dispatch terminal-loss
 *   reducer, hoisted plugin, registry mock, confetti null-stub) so this
 *   test pins the same modal-mount transition as its loss-path siblings,
 *   then assert on the hint paragraph the way W840 does for the win arm:
 *     1. The `loss-banner-hint` element is queryable (testid pin).
 *     2. It carries BOTH the shared `win-banner-hint` class and the
 *        loss-specific `loss-banner-hint` class — the dual-class hook the
 *        CSS uses to apply the loss-tinted variant on top of the shared
 *        layout. A regression that picked one but not both would silently
 *        break the visual treatment.
 *     3. Its text content names both "Enter" and "Esc" (so a future
 *        wording rewrite that keeps the keys discoverable still passes).
 *     4. Two `<kbd>` children carry those exact key names (markup pin
 *        protecting the visual key-cap styling that the .css file targets
 *        via `.win-banner-hint kbd`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Same shape as W863 — reducer flips to a `{ score: 0 }`
// terminal on a single dispatched LOSE action, the canonical losing-terminal
// shape that drives PlayPage straight into the showLossBanner=true branch
// that mounts the loss-banner-hint paragraph we want to pin.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-banner-hint-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss Banner Hint Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for loss-banner-hint paragraph assertion.",
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
// confetti — W825 pins that gate — but PlayPage still imports the module
// eagerly so we stub it here too.)
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

describe("PlayPage loss-banner hint paragraph (W876)", () => {
  it("renders the Enter/Esc keyboard hint with <kbd> key-caps when the loss banner mounts", async () => {
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

    // Drive the round into terminal-loss (score === 0). One click flips
    // isTerminal to `{ score: 0 }`, which mounts the loss banner and the
    // `{showLossBanner && <p ...>}` branch beneath it.
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-lose"));
    });

    // Sanity: end-panel mounted in its loss form. Without this guard the
    // hint assertions below could pass for the wrong reason (e.g. if the
    // win arm accidentally also rendered for a `score: 0` terminal).
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // (1) testid pin — the loss-specific paragraph itself is rendered.
    const hint = screen.getByTestId("loss-banner-hint");
    expect(hint).toBeTruthy();
    expect(hint.tagName.toLowerCase()).toBe("p");

    // (2) class pin — both the shared layout class and the loss-specific
    // override class are present. The CSS targets `.win-banner-hint` for
    // sizing/spacing and `.loss-banner-hint` for the loss-tinted variant;
    // a regression that picked one but dropped the other would silently
    // break the visual treatment.
    expect(hint.classList.contains("win-banner-hint")).toBe(true);
    expect(hint.classList.contains("loss-banner-hint")).toBe(true);

    // (3) copy pin — both key names appear in the readable text. This
    // tolerates wording tweaks (e.g. "Hit Enter…") as long as Enter and
    // Esc remain discoverable to the player who just lost.
    const text = hint.textContent ?? "";
    expect(text).toMatch(/Enter/);
    expect(text).toMatch(/Esc/);

    // (4) markup pin — the two key names are wrapped in <kbd> elements,
    // the hook the `.win-banner-hint kbd` CSS rule uses to style key-caps.
    // A regression that flattened the markup to plain text would lose the
    // visual key-cap affordance; this assertion catches that.
    const kbds = hint.querySelectorAll("kbd");
    expect(kbds.length).toBe(2);
    const kbdTexts = Array.from(kbds).map((k) => (k.textContent ?? "").trim());
    expect(kbdTexts).toContain("Enter");
    expect(kbdTexts).toContain("Esc");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
