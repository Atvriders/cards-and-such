/**
 * W1220 — `play-share-image-btn` `aria-label` accessible-name contract.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2772) renders the win/loss banner Save-image
 *   button with `aria-label="Download share image"`. The visible label
 *   inside the button is "Save image" — terse and ambiguous in a
 *   screen-reader's flat name announcement ("Save image, button") because
 *   it tells AT users *what verb* but not *what artifact* is being
 *   produced. The `aria-label` overrides the visible text so AT users
 *   hear "Download share image, button", which disambiguates this control
 *   from the sibling "Copy link", "Tweet", and "Print" pills in the same
 *   end-share row.
 *
 *   Sibling tests on the same button cover:
 *     - W192 (PlayPage.shareImage)        — click downloads an SVG Blob
 *     - W796 (PlayPage.shareImageTrack)   — click fires `play.share_image`
 *     - W557 (PlayPage.share)             — share-row interaction wiring
 *     - W1048 (PlayPage.shareImageTitle)  — `title` hover-tooltip copy
 *     - PlayPage.lossBannerShareImage     — same flow on the loss banner
 *   None pins the `aria-label`. A regression that dropped the attribute
 *   (AT falls back to "Save image", losing the artifact noun), drifted
 *   it to the visible text ("Save image" — same regression),  generic-
 *   ified it to "Save" (loses both verb specificity and artifact),
 *   or repurposed it to point at a different artifact ("Download
 *   scoresheet") would silently degrade the screen-reader experience
 *   and slip past every existing test on this button.
 *
 * Strategy mirrors the W1048 share-image-title test:
 *   - Hoist a minimal one-shot fixture plugin reaching a terminal-win on a
 *     single dispatch so the win banner — and its share row — render.
 *   - Mount PlayPage at `/play/:gameId`, advance setup → playing, dispatch
 *     the WIN action so the banner mounts.
 *   - Locate `play-share-image-btn` and pin the `aria-label` exactly.
 *   - No download path interaction; the attribute is static markup
 *     present from the moment the button mounts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// Hoisted fixture plugin reaching a terminal-win on a single dispatch.
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-image-aria-label-w1220";
  type State = { won: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "W1220 Share Image Aria Label Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning the share-image button's aria-label copy.",
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

// Confetti pulls in canvas / matchMedia surfaces jsdom doesn't implement;
// null-stub keeps the render side-effect-free regardless of reduced-motion
// state in the test harness.
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

describe("PlayPage play-share-image-btn aria-label (W1220)", () => {
  it("pins aria-label='Download share image' so screen readers announce the artifact (not just 'Save image')", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Drive: setup → playing, then dispatch WIN so the win banner — which
    // hosts the share row containing `play-share-image-btn` — mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    act(() => {
      fireEvent.click(screen.getByTestId("fixture-win"));
    });

    const shareBtn = screen.getByTestId("play-share-image-btn") as HTMLButtonElement;

    // Accessible-name contract. Drift to the visible label ("Save image"),
    // generic-ification ("Save"), drop ("Save image" via fallback), or
    // mis-pointing the artifact ("Download scoresheet") would all be
    // invisible to every other test on this button.
    expect(shareBtn.getAttribute("aria-label")).toBe("Download share image");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
