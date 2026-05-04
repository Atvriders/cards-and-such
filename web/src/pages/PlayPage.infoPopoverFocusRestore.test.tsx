/**
 * Unit test for PlayPage info-popover focus restoration on close (W1031).
 *
 * Companion to W1009 (focus moves *into* the popover on open) and W1014
 * (Escape dismisses the popover). This test pins the *return half* of the
 * modal focus contract that AT users rely on: when the popover unmounts,
 * `useFocusTrap`'s cleanup must restore focus to whatever element was
 * focused at activation time — i.e. the trigger button (`play-info-btn`).
 *
 * `useFocusTrap` (web/src/platform/useFocusTrap.ts ~line 36-69) snapshots
 * `document.activeElement` when `active` flips true and re-focuses it on
 * cleanup, guarded against the node having been removed from the DOM.
 * PlayPage wires `useFocusTrap(infoPopoverRef, infoOpen)` at line ~659.
 *
 * Sibling tests cover focus *into* the popover (W1009 infoPopoverFocus),
 * the role/aria attributes (W984 etc.), and the Escape dismiss path
 * (W1014). None observe focus *return* on dismiss — a regression that
 * unwired the trap, dropped the previously-focused snapshot, or swapped
 * the close path to one that detaches the trigger from the DOM before
 * cleanup runs would silently break WCAG 2.4.3 / 3.2.1 here. This test
 * pins exactly that.
 *
 * Strategy mirrors the W704 Tutorial focus restoration test:
 *   - Mock the registry with a one-game fixture so PlayPage mounts cheaply.
 *   - Advance past setup so the in-game toolbar (with the info button) is
 *     present.
 *   - Focus the trigger explicitly (the trap captures the *currently*
 *     focused element at activation time — userEvent.click would do this
 *     too, but explicit focus is unambiguous about intent).
 *   - Click the trigger to open the popover.
 *   - Press Escape to dismiss.
 *   - Assert document.activeElement is the trigger button again.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-popover-focus-restore-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Popover Focus Restore Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the info-popover focus-restore test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship — null-stub keeps any
// stray render path side-effect-free.
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

describe("PlayPage info popover focus restoration on close (W1031)", () => {
  it("returns focus to the trigger button after Escape dismisses the popover", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the in-game
    // toolbar (with the info button) mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const trigger = screen.getByTestId("play-info-btn") as HTMLButtonElement;

    // Explicitly focus the trigger before activation — the trap snapshots
    // `document.activeElement` at the moment `infoOpen` flips true, so we
    // need the trigger to *be* the focused element going in.
    act(() => {
      trigger.focus();
    });
    expect(document.activeElement).toBe(trigger);

    // Open the popover. useFocusTrap moves focus into the popover surface.
    act(() => {
      fireEvent.click(trigger);
    });
    expect(screen.getByTestId("play-info-popover")).toBeTruthy();
    expect(document.activeElement).not.toBe(trigger);

    // Dismiss via Escape — the popover unmounts and the trap cleanup runs.
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(screen.queryByTestId("play-info-popover")).toBeNull();

    // The contract under test: cleanup restored focus to the trigger.
    expect(document.activeElement).toBe(trigger);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
