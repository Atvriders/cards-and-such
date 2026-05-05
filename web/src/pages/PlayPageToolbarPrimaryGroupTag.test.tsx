/**
 * Unit test pinning the PlayPage primary toolbar group's tagName (W2183).
 *
 * Coverage gap: existing primary-toolbar tests pin neighbouring contracts:
 *   - W939  toolbarPrimaryRole       → `role` is absent (null).
 *   - W1360 toolbarPrimaryGroupClass → both `play-toolbar-group` AND
 *                                      `play-toolbar-primary` classList
 *                                      tokens are present.
 * Neither test asserts the *element type* of the wrapper. PlayPage.tsx
 * (~line 1960) renders the primary cluster as a `<div>`. A refactor that
 * swapped it for a `<nav>`, `<menu>`, `<section>`, `<ul>`, or `<form>`
 * would silently change semantics for assistive tech and CSS selectors
 * (e.g. `div.play-toolbar-group` rules in PlayPage.css) without any
 * existing test failing — className, testid, role, and child buttons all
 * transfer unchanged across host elements. This test pins
 * `tagName === "DIV"` so any structural drift is surfaced immediately.
 *
 * Strategy mirrors PlayPageToolbarPrimaryGroupClass.test.tsx (W1360):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Confetti is null-stubbed because it pulls in canvas APIs jsdom
 *     does not ship.
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the toolbar only renders once setup is complete).
 *   - Locate the primary toolbar via its testid.
 *   - Pin the single observable attribute: `tagName === "DIV"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "toolbar-primary-group-tag-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Toolbar Primary Group Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the primary-toolbar tagName test.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
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

describe("PlayPage primary toolbar group tagName (W2183)", () => {
  it("primary toolbar wrapper is a <div> element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The primary toolbar only mounts in the playing phase, so advance
    // past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const primary = screen.getByTestId("play-toolbar-primary");

    // Pin the host element type — class/role/testid all transfer
    // unchanged across host elements, so the tagName is the only
    // observable structural anchor a refactor cannot drift through
    // unnoticed.
    expect(primary.tagName).toBe("DIV");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
