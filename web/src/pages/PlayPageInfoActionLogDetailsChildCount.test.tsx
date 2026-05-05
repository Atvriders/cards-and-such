/**
 * Unit test for the PlayPage info popover Action-log <details> direct-child
 * count (W1823).
 *
 * Sibling action-log tests pin the disclosure's outer shape: W1088 covers the
 * <details> tagName + collapsed-default + parent classes; W1097 covers the
 * summary-click expand mechanic; W1813 / W1330 / W1477 cover the <summary>
 * label/count + className + cursor; W1097's siblings cover the <ol> attrs
 * (className, testid, list-style, max-height, overflow-y, padding, margin,
 * font-size). What none of those assertions catch is the *direct-child arity*
 * of the <details> itself: the source contract requires exactly two element
 * children — a single <summary> followed by a single <ol> — with no extra
 * wrappers. A regression that wrapped the <ol> in a scroll <div>, hoisted a
 * sibling <button>, or split the disclosure into multiple <ol>s would still
 * pass the existing tests (the testid still resolves, the summary still
 * carries its label) but would invalidate the popover's "summary + list"
 * disclosure contract that screen readers rely on.
 *
 * Strategy mirrors PlayPage.infoPopoverActionLogCollapsed.test.tsx: vi.hoisted
 * fixture plugin via a mocked GAMES registry, mount PlayPage at /play/:gameId,
 * click `start-game` to reach the playing phase, open the info popover via
 * `play-info-btn`, walk from the action-log <ol> testid to its parent
 * <details>, and assert `childElementCount === 2` with the first child being
 * the <summary> and the second being the <ol> we resolved by testid.
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
  const TEST_GAME_ID = "info-popover-action-log-details-childcount-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Action Log Details Child Count Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for action-log details childElementCount tests.",
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

describe("PlayPage info popover action-log <details> direct-child count (W1823)", () => {
  it("renders exactly two element children: <summary> followed by the action-log <ol>", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Enter the playing phase so the info button is available.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the info popover so the action-log <details> mounts.
    fireEvent.click(screen.getByTestId("play-info-btn"));
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();

    // Resolve the <ol> via testid, then walk up to the parent <details>.
    const log = screen.getByTestId("play-action-log");
    const details = log.closest("details") as HTMLDetailsElement | null;
    expect(details).not.toBeNull();

    // Direct-child arity: the disclosure must contain exactly the summary
    // and the rolling-action <ol>, with no extra wrappers (a scroll <div>
    // around the <ol>, a sibling action button, or a split <ol> would all
    // bump this past 2 — or, in the split case, fail the ordering check).
    expect(details!.childElementCount).toBe(2);

    // Order matters: <summary> must come first so the disclosure widget
    // is keyboard-reachable before its body, and the <ol> we resolved
    // above must be the second (and only other) child.
    expect(details!.children[0].tagName).toBe("SUMMARY");
    expect(details!.children[1]).toBe(log);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
