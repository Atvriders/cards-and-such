/**
 * Unit test for PlayPage hint-pulse floating tooltip lifecycle (W725).
 *
 * In addition to adding/removing the `.hint-pulse` class on the matched
 * element (covered by W496 in `PlayPage.hint.test.tsx`), `showHint` also
 * appends a floating `<div class="hint-pulse-tooltip">` to `document.body`
 * containing a "💡 Hint" title and a "Try this" body. The tooltip is
 * auto-dismissed after a fixed 2000ms window, INDEPENDENTLY of the
 * `pulses * 500ms` pulse window — a deliberate decoupling so long pulse
 * animations don't leave the label hanging on screen.
 *
 * That tooltip lifetime is the only piece of `showHint` not exercised by
 * existing tests:
 *   - W496 covers the class add/remove on the target element
 *   - W692/W698 cover the cooldown-button gating
 * Neither asserts anything about the body-attached tooltip, so the 2s
 * teardown could regress silently. This test pins the contract:
 *   1. Tooltip appears in the document after a successful hint click
 *   2. Tooltip is still present just before 2000ms
 *   3. Tooltip is removed from the DOM at/after 2000ms
 *
 * Strategy mirrors W698 (PlayPage.hintCooldown.test.tsx): install fake
 * timers with `shouldAdvanceTime: true` BEFORE mount so any mount-phase
 * microtasks aren't frozen, then drive the virtual clock through the
 * tooltip's 2s lifetime.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so the vi.mock factory below can reference it. The plugin
// exposes a `hint` whose selector resolves on the rendered Game so showHint
// reaches the tooltip-creation branch (failed lookups bail before it).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "hint-tooltip-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hint Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for hint-pulse tooltip lifecycle tests.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    // Use a small `pulses` count so the (independent) tooltip lifetime
    // is the dominant timer under test. Even a 1-pulse hint still
    // appends + auto-removes the tooltip on the same 2s schedule.
    hint: () => ({ selector: "[data-testid='hint-target']", pulses: 1 }),
    component: () => (
      <div>
        <div data-testid="hint-target">target</div>
      </div>
    ),
  };
  // Keep a `klondike`-shaped entry so any registry-coupled lobby code
  // that scans for it doesn't blow up.
  const klondikeFixture = { ...fixturePlugin, id: "klondike", title: "Klondike" };
  return { TEST_GAME_ID, fixturePlugin, klondikeFixture };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin, hoisted.klondikeFixture],
}));

beforeEach(() => {
  localStorage.clear();
  // Make both the user-level hints toggle AND the cooldown toggle explicit
  // so this test isn't subject to default-changes elsewhere. Cooldown is
  // disabled here because it isn't the contract under test — keeping it
  // off avoids any interaction with the 1Hz cooldown ticker.
  localStorage.setItem("cards-hints-enabled", "true");
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage hint pulse tooltip lifecycle (W725)", () => {
  it("appends .hint-pulse-tooltip on click and removes it after 2000ms", async () => {
    // Install fake timers BEFORE mount per the W639 / W698 pattern so any
    // mount-phase setTimeout / setInterval registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks from deadlocking on the frozen clock.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so the toolbar (containing the Hint
    // button) commits and the fixture's Game.tsx renders the hint target.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: no tooltip exists in the document before the hint click.
    expect(document.querySelector(".hint-pulse-tooltip")).toBeNull();

    // Click the Hint button — showHint resolves the selector, adds the
    // pulse class, AND appends the floating tooltip to document.body.
    fireEvent.click(screen.getByTestId("play-hint-btn"));

    // Tooltip must be present immediately after the click — it's
    // appended synchronously inside showHint, not inside an effect.
    const tooltip = document.querySelector(".hint-pulse-tooltip");
    expect(tooltip).not.toBeNull();
    // It should carry the title + body content the implementation
    // hard-codes — pinning these protects against accidental copy
    // changes that would break the contract a screenreader observes.
    expect(tooltip?.querySelector(".hint-pulse-tooltip-title")?.textContent).toBe(
      "💡 Hint",
    );
    expect(tooltip?.querySelector(".hint-pulse-tooltip-body")?.textContent).toBe(
      "Try this",
    );

    // Just before the 2s teardown the tooltip must still be in the DOM —
    // showHint schedules removal at exactly 2000ms.
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(document.querySelector(".hint-pulse-tooltip")).not.toBeNull();

    // Crossing the 2000ms boundary fires the cleanup setTimeout which
    // calls `tooltip.remove()` — the node must be detached from the DOM.
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(document.querySelector(".hint-pulse-tooltip")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
