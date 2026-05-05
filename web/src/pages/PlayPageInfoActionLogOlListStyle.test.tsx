/**
 * Unit test for the PlayPage info popover action-log <ol> inline
 * `list-style` style (W1702).
 *
 * The action-log <ol> under the info popover ships an inline
 * `style={{ ..., listStyle: "none", ... }}` so the rolling breadcrumb
 * entries render without the default decimal numbering markers — the
 * `<code>` action type and the timestamp `<span>` are the only intended
 * affordances per row. Existing sibling tests pin the <ol> className
 * (W1490), the <details>/<summary> wrapper className (W1330), the summary
 * cursor (W1477), the inline maxHeight (W1496), the empty-state copy
 * (W1379), the entry order (W208), and the expand/open behaviour (W1097)
 * — but none assert the inline `list-style` reset. A regression that
 * dropped the property (or moved it to a stylesheet that fails to load)
 * would re-introduce default `1.`, `2.`, ... markers next to every
 * action-type code, doubling the visual noise inside an already-dense
 * debug surface.
 *
 * Strategy mirrors PlayPageInfoActionLogOlMaxHeight.test.tsx (W1496):
 *   - Render PlayPage with a no-op fixture plugin so the info popover
 *     mounts in a deterministic state.
 *   - Click the info button to open the popover so <details>/<ol>
 *     mount.
 *   - Resolve the action-log <ol> via `data-testid="play-action-log"`
 *     and assert `style.listStyle` (or its longhand `listStyleType`)
 *     is exactly `"none"`. jsdom serialises React's `listStyle: "none"`
 *     into the `listStyleType` longhand, so we accept either surface.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — vi.hoisted runs before vi.mock factories evaluate,
// so the closure capture below is safe despite resembling a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-action-log-ol-liststyle-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Action Log Ol ListStyle Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log <ol> list-style test.",
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
  vi.restoreAllMocks();
});

describe("PlayPage info popover action-log <ol> list-style (W1702)", () => {
  it("renders the action-log list with inline listStyle 'none' so the rolling breadcrumb has no default markers", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter playing phase so the info button is available and the
    // action-log section mounts inside the popover.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover so the <details>/<ol> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Pin the inline list-style reset. React's `listStyle: "none"` may be
    // surfaced by jsdom either as the shorthand `listStyle` or expanded to
    // the `listStyleType` longhand depending on engine quirks; accept
    // either, but require the resolved value to be exactly "none".
    const log = screen.getByTestId("play-action-log") as HTMLOListElement;
    const shorthand = log.style.listStyle;
    const longhand = log.style.listStyleType;
    expect(shorthand === "none" || longhand === "none").toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
