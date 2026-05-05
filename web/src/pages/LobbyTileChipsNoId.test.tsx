import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2074 — pin the ABSENCE of an `id` attribute on the lobby
 * tile's `.tile-chips` wrapper.
 *
 * The `TileMetaChips` component (LobbyPage.tsx ~L2728) wraps the
 * eta + difficulty pills in a `<div class="tile-chips">`. The
 * wrapper is rendered once per tile, so adding a static `id`
 * would produce duplicate ids in the DOM (an HTML validity
 * violation that also confuses `document.getElementById`,
 * `aria-labelledby`, and CSS `#id` selectors).
 *
 * Sibling W1397 (LobbyTileChipsAria) pins the wrapper's
 * `aria-hidden="false"`, W1692 (LobbyTileChipsChildCount) pins
 * its child count, and LobbyTileChipsClassEq pins the exact
 * className string. The `id`-absence invariant — equally
 * load-bearing because tile chips render N-times per lobby —
 * had no dedicated coverage: grepping `Lobby*.test.tsx` for
 * `tile-chips` + `id` / `hasAttribute` returns nothing.
 *
 * Lives in a NEW SIBLING file per the same rationale as the
 * other W-series Lobby tests: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits
 * to the mega-file.
 */
describe("LobbyPage — tile-chips wrapper has no id (W2074)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders at least one tile-chips wrapper without an `id` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tile-chips tests.
    await screen.findByPlaceholderText(/search/i);

    const wrappers = document.querySelectorAll<HTMLElement>(
      "div.tile-chips",
    );
    expect(wrappers.length).toBeGreaterThan(0);

    // The wrapper must NOT carry an `id` — duplicate ids across
    // tiles would be an HTML validity violation and break any
    // `getElementById` / CSS `#id` selector that races the lobby.
    const wrapper = wrappers[0]!;
    expect(wrapper.hasAttribute("id")).toBe(false);
  });
});
