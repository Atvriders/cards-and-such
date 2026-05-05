/**
 * W2225 — focused coverage of the PlayPage page-title `<h1>` element's
 * absence of a `role` attribute.
 *
 * PlayPage.tsx (~line 1673) renders the loaded plugin's title as
 *   `<h1>{plugin.title}</h1>`
 * inside `.play-header-titlerow`. It is the page's primary heading and
 * anchors the document outline (a11y + SEO).
 *
 * The element ships WITHOUT an explicit `role` attribute. A native `<h1>`
 * already has the implicit ARIA role of "heading" (with implicit aria-level
 * of 1), so a redundant `role="heading"` is unnecessary and an
 * overriding/contradicting `role` (e.g. `role="banner"` or `role="region"`)
 * would actively break the document outline for assistive tech.
 *
 * Existing sibling coverage:
 *   - PlayPageH1Tag.test.tsx (W1951) pins the tagName === "H1" via a
 *     document-level `querySelector("h1")` lookup.
 *   - PlayPageH1NoId.test.tsx pins absence of `id`.
 *   - PlayPageH1NoStyle.test.tsx pins absence of inline `style`.
 *   - PlayPageH1NoClassAttr.test.tsx pins absence of the `class` attribute.
 *   - PlayPageH1Class.test.tsx and PlayPageH1Count.test.tsx pin
 *     class/count facts.
 *
 * None of those pin the `role` attribute. A regression that added
 * `role="heading"` (redundant) or, worse, a contradicting role like
 * `role="presentation"` (which strips the heading semantics entirely)
 * would slip past every existing h1 test. This file pins the load-bearing
 * fact: the primary `<h1>` carries no `role` attribute, so its native
 * heading semantics are intact.
 *
 * Strategy mirrors PlayPageH1Tag.test.tsx (hoisted-fixture pattern):
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
  const TEST_GAME_ID = "h1-no-role-fixture";
  const TEST_TITLE = "H1 No Role Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2225 h1 no-role test.",
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

describe("PlayPage h1 no role attribute (W2225)", () => {
  it("renders the page title h1 without a `role` attribute", async () => {
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
    // Pin: native <h1> has implicit role="heading"; no explicit role attr.
    expect(h1!.hasAttribute("role")).toBe(false);
  });
});

void React;
