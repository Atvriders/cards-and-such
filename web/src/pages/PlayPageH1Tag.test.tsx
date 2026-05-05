/**
 * W1951 — focused coverage of the PlayPage page-title element's raw
 * `tagName` reached via the document-level `querySelector("h1")` selector.
 *
 * PlayPage.tsx (~line 1673) renders the loaded plugin's title as
 *   `<h1>{plugin.title}</h1>`
 * inside `.play-header-titlerow`. It is the page's primary heading and
 * anchors the document outline (a11y + SEO).
 *
 * Existing sibling coverage:
 *   - PlayPage.headerTitle.test.tsx (W896) reaches the heading through
 *     a SCOPED selector — `container.querySelector(".play-header-titlerow h1")`
 *     — and only verifies the tag name AFTER pre-filtering by parent
 *     class. A regression that left an `<h1>` somewhere in the titlerow
 *     class but moved the real title node out (or swapped it for
 *     `<div role="heading" aria-level="1">` while injecting an empty
 *     placeholder `<h1>` to keep the W896 selector green) would slip past.
 *
 * Pin the load-bearing fact through the SAME path used by W1899/W1904/W1912:
 * a raw, document-level `querySelector("h1")` lookup that does not pre-filter
 * by class, role, or level. The first `<h1>` in the rendered tree must be a
 * real `<h1>` element (tagName === "H1") — proving that the document-outline
 * primary heading really is an h1 tag, not a styled div with aria-level set.
 *
 * Strategy mirrors PlayPage.headerTitle.test.tsx (hoisted-fixture pattern):
 *   - vi.hoisted fixture plugin so the vi.mock factory captures it.
 *   - Confetti null-stub avoids canvas APIs jsdom does not ship.
 *   - Mount at `/play/:gameId` — the header h1 renders in any phase, no
 *     need to click `start-game`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "h1-tag-fixture";
  const TEST_TITLE = "H1 Tag Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W1951 h1 tagName test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, TEST_TITLE, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

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

describe("PlayPage h1 tagName (W1951)", () => {
  it("renders the page title as a literal <h1> element", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const h1 = document.querySelector("h1");
    expect(h1).not.toBeNull();
    // Pin tagName via a selector that does NOT pre-filter by class/role/level.
    expect(h1!.tagName === "H1").toBe(true);
  });
});

void React;
