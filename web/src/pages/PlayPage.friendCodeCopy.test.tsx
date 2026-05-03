/**
 * Unit test for the friend banner's copy-to-clipboard interaction (W202/W643).
 *
 * Observable behavior:
 *   When the page is mounted with `?friend=1` (and the active plugin opts
 *   into multiplayer), the friend banner exposes a `play-friend-code`
 *   button that renders the encoded 6-char challenge string in a `<code>`
 *   element. Clicking that button must call `navigator.clipboard.writeText`
 *   exactly once with the same 6-char code the user can see -- no padding,
 *   no URL wrapping, no hyphenation. That is the contract the share UI
 *   makes with the user, and it lives at the wiring seam between the
 *   button's `onClick` handler and the encoder output, so a test at the
 *   UI level catches regressions either side of that boundary.
 *
 * Strategy:
 *   - Use a `vi.hoisted` multiplayer-capable fixture plugin (mirroring
 *     PlayPage.friend.test.tsx and PlayPage.friendCode.test.tsx) so the
 *     registry mock returns a single deterministic entry. That keeps the
 *     friend-code dictionary index stable at slot 0 and makes the encoded
 *     code depend only on the seed -- no coupling to the real GAMES order.
 *   - Stub `navigator.clipboard` via `Object.defineProperty` with a
 *     `vi.fn`-backed `writeText` so we can assert call args directly
 *     rather than reading back a written string -- this also exercises
 *     the `navigator.clipboard?.writeText` guard in PlayPage.tsx.
 *   - Mount with `?seed=42&friend=1`, fire a click, and assert that the
 *     mock was called once with the same 6-char code text rendered in
 *     the `<code>` element. Cross-check it matches `^[0-9A-Z]{6}$` so a
 *     drift in encoder shape that still happens to round-trip through
 *     the click handler still trips this test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted multiplayer-capable fixture. Same shape as the sibling
// friend-mode tests so the registry mock resolves to a single plugin at
// dictionary slot 0 -- guaranteeing the encoder produces a code and the
// banner renders the copy button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (friend-code copy test)",
    category: "solitaire" as const,
    players: { min: 1, max: 2, multiplayer: true },
    description: "Friend-code clipboard copy test fixture.",
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

describe("PlayPage friend banner code copy (W202/W643)", () => {
  it("clicking play-friend-code copies the displayed 6-char code via clipboard.writeText", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    // Stub the clipboard so writeText resolves and we can inspect the
    // call args. `navigator.clipboard` is non-writable in jsdom by
    // default, hence the defineProperty dance -- mirrors the pattern
    // used in PlayPage.friend.test.tsx for the share-URL flow.
    const writeText = vi.fn(async (_text: string) => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

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

    // The code text the user sees lives inside the <code> element nested
    // in the copy button. We read it first so the assertion below pins
    // "what was clicked" to "what was copied" rather than independently
    // recomputing the encoder output (already covered by the sibling
    // shape test).
    const button = screen.getByTestId("play-friend-code");
    const codeEl = button.querySelector("code");
    expect(codeEl).not.toBeNull();
    const displayed = (codeEl?.textContent ?? "").trim();
    expect(displayed).toMatch(/^[0-9A-Z]{6}$/);

    await act(async () => {
      fireEvent.click(button);
    });

    // The whole point of the test: writeText must be called exactly
    // once, with the same 6-char code the user can read on screen.
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(displayed);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
