/**
 * Unit test for the friend banner's 6-character friend-code rendering (W562).
 *
 * Observable behavior:
 *   When the page is mounted with `?friend=1` (and the active plugin opts
 *   into multiplayer), the friend banner renders a copy-code button whose
 *   inner `<code>` element holds the encoded challenge string produced by
 *   `friendCode.encodeChallenge`. That string is contractually a
 *   6-character Crockford-ish base32 code -- exactly six chars from the
 *   `[0-9A-Z]` alphabet -- so this test asserts both length and shape so
 *   any drift in the encoder (or in how the banner surfaces it) is
 *   caught at the UI seam rather than only at the encoder unit-test seam.
 *
 * Strategy:
 *   - Use a `vi.hoisted` multiplayer-capable fixture plugin so the
 *     registry mock returns a single deterministic entry. This keeps the
 *     friend-code dictionary index stable (slot 0) and means the encoder
 *     output depends only on the seed -- no coupling to the real GAMES
 *     order, which would otherwise make the test brittle.
 *   - Mount with `?seed=42&friend=1` to exercise the friendMode branch
 *     that renders the banner + code button in one shot.
 *   - Read the displayed code from the `<code>` element nested inside the
 *     `play-friend-code` button (the visual text the user actually sees)
 *     and assert it is six chars long and matches `^[0-9A-Z]{6}$`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Mirrors the layout in
// PlayPage.friend.test.tsx so the registry mock resolves to a single
// plugin at dictionary slot 0 -- giving the encoder a stable input and
// the banner a guaranteed code to render.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code shape test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (s: { seed: number }) => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Stable seed so the encoded code is deterministic if a future failure
// needs to be triaged from the test output.
const FIXED_SEED = 42;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage friend banner code shape (W562)", () => {
  it("renders a 6-char [0-9A-Z] friend code when ?friend=1 is in the URL", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    const { encodeChallenge, MAX_FRIEND_SEED } = await import(
      "../platform/friendCode.js"
    );

    render(
      <MemoryRouter
        initialEntries={[
          `/play/${hoisted.TEST_GAME_ID}?seed=${FIXED_SEED}&friend=1`,
        ]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Banner is the friend-mode envelope; the code button lives inside it.
    expect(screen.getByTestId("play-friend-banner")).toBeTruthy();

    // The rendered code is the text content of the `<code>` element
    // nested inside the copy button -- that is what the user actually
    // reads aloud or texts to a friend.
    const button = screen.getByTestId("play-friend-code");
    const codeEl = button.querySelector("code");
    expect(codeEl).not.toBeNull();
    const displayed = (codeEl?.textContent ?? "").trim();

    // Shape assertions: exactly 6 chars from the Crockford-ish base32
    // alphabet (digits + uppercase letters, no I/L/O/U). The regex is
    // intentionally a superset of the actual alphabet so it catches the
    // common failure modes (lowercase leak, length drift, padding bleed)
    // without coupling the test to the alphabet's specific letter set.
    expect(displayed.length).toBe(6);
    expect(displayed).toMatch(/^[0-9A-Z]{6}$/);

    // Cross-check: the displayed code should equal exactly what
    // `encodeChallenge` returns for the same {gameId, seed & 0xffff}
    // pair the banner uses. This pins the wiring -- if the banner ever
    // starts rendering a different transform of the code (e.g. truncated
    // or hyphenated), this assertion fails before the shape one above.
    const expected = encodeChallenge({
      gameId: hoisted.TEST_GAME_ID,
      seed: FIXED_SEED & MAX_FRIEND_SEED,
    });
    expect(displayed).toBe(expected);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
