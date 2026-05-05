/**
 * W2111 — focused coverage of the PlayPage page-title h1's lack of an
 * inline `style` HTML attribute.
 *
 * PlayPage.tsx (~line 1673) renders the loaded plugin's title as
 *   `<h1>{plugin.title}</h1>`
 * inside `.play-header-titlerow`. The element is intentionally a *bare*
 * `<h1>` — no class, no id, no aria-* and crucially no inline `style`.
 * The outer `<main>` element does receive a computed `style={playPageStyle}`
 * prop (line 1662), so the visual treatment of the heading flows from
 * cascading CSS via descendant selectors (`.play-header-titleblock h1`,
 * etc.), not from per-instance inline declarations on the heading itself.
 * Adding any inline `style` to the h1 — even an empty `style=""` — would
 * silently couple per-render layout decisions to the heading, defeating
 * theming and override hooks that rely on stylesheet specificity.
 *
 * Existing sibling coverage:
 *   - PlayPageH1Class.test.tsx (W2007) pins `h1.className === ""`.
 *   - PlayPageH1NoClassAttr.test.tsx (W2093) pins `hasAttribute("class")
 *     === false`.
 *   - PlayPageH1NoId.test.tsx (W2004) pins `hasAttribute("id") === false`.
 *   - PlayPageH1Tag.test.tsx (W1951) pins `tagName === "H1"`.
 *   - PlayPage.headerTitle.test.tsx (W896) asserts only the textContent.
 * None of these say anything about an inline `style` attribute on the
 * heading. A regression that added `style={{}}` (or any other style
 * object) to the h1 would slip past every existing assertion.
 *
 * Pin the attribute-presence fact directly via `hasAttribute("style")`,
 * which checks DOM attribute presence regardless of value (including the
 * empty string — React renders `style={{}}` as no attribute, but
 * `style={{ color: "" }}` or any non-empty object would surface).
 *
 * Strategy mirrors PlayPageH1NoClassAttr.test.tsx (hoisted-fixture pattern):
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
  const TEST_GAME_ID = "h1-no-style-fixture";
  const TEST_TITLE = "H1 No-Style Fixture Game";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: TEST_TITLE,
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Sentinel description for the W2111 h1 no-style test.",
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

describe("PlayPage h1 has no inline style attribute (W2111)", () => {
  it("renders the page-title <h1> without a `style` HTML attribute", async () => {
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
    // Pin attribute-presence directly. The outer <main> intentionally
    // carries `style={playPageStyle}`, but the heading must remain a
    // bare <h1> with no inline style coupling.
    expect(h1!.hasAttribute("style") === false).toBe(true);
  });
});

void React;
