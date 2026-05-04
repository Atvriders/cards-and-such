/**
 * W1048 — `play-share-image-btn` `title` attribute copy contract.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2773) renders the win/loss banner Save-image button
 *   with `title="Download a 1200×630 share card"`. The native browser
 *   tooltip surfaces this copy on pointer hover (and assistive tech may
 *   read it via the accessible description) so a player understands they
 *   are about to download a *graphic* — not a JSON, a screenshot, or a
 *   PNG of arbitrary size — and at what dimensions. Sibling tests on the
 *   same button cover:
 *     - W192 (PlayPage.shareImage)        — click downloads an SVG Blob
 *     - W557 (PlayPage.share)             — share-row interaction wiring
 *     - PlayPage.shareImageTrack          — click fires `play.share_image`
 *     - PlayPage.lossBannerShareImage    — same flow on the loss banner
 *   None pins the `title` copy. A regression that drifted it to the
 *   button's own visible label ("Save image"), to a generic
 *   "Download an image" (drops the dimension hint), to the wrong
 *   dimensions (e.g. "1080×1080"), or dropped the attribute entirely
 *   (kills the hover tooltip on desktop) would silently degrade the
 *   share affordance and slip past every existing test.
 *
 * Strategy mirrors the W192 share-image test:
 *   - Hoist a minimal one-shot fixture plugin reaching a terminal-win on a
 *     single dispatch so the win banner — and its share row — render.
 *   - Mount PlayPage at `/play/:gameId`, advance setup → playing, dispatch
 *     the WIN action so the banner mounts.
 *   - Locate `play-share-image-btn` and pin the `title` attribute exactly.
 *   - No download path interaction; the attribute is static markup
 *     present from the moment the button mounts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// Hoisted fixture plugin reaching a terminal-win on a single dispatch.
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-image-title-w1048";
  type State = { won: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "W1048 Share Image Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning the share-image button's title attribute copy.",
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

describe("PlayPage play-share-image-btn title attribute (W1048)", () => {
  it("pins title='Download a 1200×630 share card' so the native hover tooltip describes the share-card download dimensions", async () => {
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

    // Native browser tooltip / a11y description contract. Drift to the
    // button's own visible label ("Save image"), to a generic
    // "Download an image" (loses dimension hint), to a wrong dimension
    // ("1080×1080"), or dropping the attribute entirely (no hover
    // tooltip on desktop) would all be invisible to every other test
    // on this button.
    expect(shareBtn.getAttribute("title")).toBe("Download a 1200×630 share card");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
