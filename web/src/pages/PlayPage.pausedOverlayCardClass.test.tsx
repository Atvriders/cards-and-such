/**
 * W1196 — focused test for the structural `play-paused-card` and
 * `play-paused-title` CSS classes inside the paused overlay.
 *
 * Sibling coverage map for the paused overlay:
 *   - W1122 — overlay mount/unmount gated on `paused`
 *   - W1141 — role="status" + aria-live="polite"
 *   - W1137 — visible copy ("Paused" + <kbd>Esc</kbd>)
 *   - W1146 — click Resume unpauses
 *   - W1188 — Resume button tagName/textContent contract
 *   - W1190 — outer `.play-paused-overlay` className
 *   - W1195 — discovery: card + title classes are uncovered
 *
 * What's still uncovered (until this file): the *inner* card structure.
 * The overlay scrim is positioned via `.play-paused-overlay`, but the
 * visible "card" surface — the centred panel with the "Paused" headline
 * and the keybind hint — is its own styling hook (`.play-paused-card`
 * containing `.play-paused-title`). If a refactor renames or drops the
 * card wrapper or title element, the overlay would still mount, the
 * scrim would still render, and aria announcements would still fire —
 * but the visual card would silently disappear. No other sibling test
 * would catch that.
 *
 * This file locks that single contract:
 *   <div className="play-paused-overlay" ...>
 *     <div className="play-paused-card">
 *       <div className="play-paused-title">Paused</div>
 *       ...
 *     </div>
 *   </div>
 *
 * Uses `vi.hoisted` for the same TDZ reason documented in the sibling
 * tests: vi.mock factories run before top-level const initialisers.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — see header comment for the TDZ rationale.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-card-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Card Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1196 paused-card class test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage paused overlay card class (W1196)", () => {
  it("renders a play-paused-card child containing a play-paused-title", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup screen so the in-game pause surface is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Trigger the pause via the keybind — same path exercised by W1122.
    fireEvent.keyDown(window, { key: "Escape" });

    const overlay = screen.getByTestId("play-paused-overlay");
    expect(overlay).toBeTruthy();

    // The card wrapper must live inside the overlay and carry the
    // `.play-paused-card` styling hook so the centred panel renders.
    const card = overlay.querySelector(".play-paused-card");
    expect(card).not.toBeNull();
    expect(card!.parentElement).toBe(overlay);

    // The title must live inside the card and carry the
    // `.play-paused-title` hook so the "Paused" headline is styled.
    const title = card!.querySelector(".play-paused-title");
    expect(title).not.toBeNull();
    expect(title!.parentElement).toBe(card);
    expect(title!.textContent).toBe("Paused");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
