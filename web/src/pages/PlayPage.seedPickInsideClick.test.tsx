/**
 * W1028 — PlayPage seed-pick popover does NOT dismiss on inside click.
 *
 * Companion / inverse of W1002 (outside-click dismisses). The window-level
 * `mousedown` listener installed for the seed picker (PlayPage.tsx ~line
 * 682-688) explicitly returns early when the event target is contained
 * inside `seedPickerRef.current` (the popover) or `seedPickerBtnRef.current`
 * (the trigger button). That containment guard is what lets a user
 * interact with the input, stepper, and action buttons without the
 * popover collapsing under them.
 *
 * Existing seed-picker tests cover open (W991), Escape close (W992),
 * outside-click dismiss (W1002), Random (W205), Daily (W324), Apply
 * (W1023), input typing (W1026), and stepper up/down (W1004 / W1005),
 * but none asserts the inverse of the outside-click branch: a mousedown
 * INSIDE the popover container leaves the popover mounted. A regression
 * that flipped the containment check (or removed it) would silently
 * close the popover the moment the user moused down on the input,
 * breaking every interactive element it hosts.
 *
 * Strategy mirrors PlayPage.seedPickOutsideClick.test.tsx (W1002):
 *   - vi.hoisted fixture plugin registered as the sole game so the route
 *     resolves without pulling in the real registry.
 *   - Plugin id "klondike" so the seed-pick toolbar button renders.
 *   - URL `?seed=42` pins the starting seed for deterministic mounting.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Seed-picker inside-click test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (state: { seed: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

vi.mock("./dailyPicker.js", () => ({
  todayStamp: () => "2026-05-02",
  hashStamp: () => 1234567,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage seed-pick popover inside-click (W1028)", () => {
  it("mousedown inside the picker does NOT dismiss it", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker (W991 pattern).
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    const picker = screen.getByTestId("play-seed-picker");
    expect(picker).toBeTruthy();

    // Mousedown on the input element — a descendant of the popover. The
    // window-level outside-click handler should hit the
    // `seedPickerRef.current?.contains(t)` early-return and leave the
    // popover mounted. Mousedown bubbles from the input up to window,
    // matching how the browser delivers it during a real click.
    const input = screen.getByTestId("play-seed-input");
    act(() => {
      fireEvent.mouseDown(input);
    });
    // Popover still open after a mousedown on a descendant.
    expect(screen.queryByTestId("play-seed-picker")).toBeTruthy();

    // Also exercise mousedown on the popover container itself (inclusive
    // containment — `Node.contains(node)` returns true for the node
    // itself). A regression that swapped contains() for a strict-descendant
    // check would close the popover here.
    act(() => {
      fireEvent.mouseDown(picker);
    });
    expect(screen.queryByTestId("play-seed-picker")).toBeTruthy();

    // Sanity-check the inverse path still works: a mousedown on
    // document.body (outside the popover) closes it. This pins the
    // pair — inside-click silent, outside-click dismissive — in one test.
    act(() => {
      fireEvent.mouseDown(document.body);
    });
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });
});

void React;
