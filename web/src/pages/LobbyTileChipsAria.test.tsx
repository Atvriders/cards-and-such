import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1397 — pin the `aria-hidden="false"` attribute on the lobby
 * tile's `tile-chips` wrapper.
 *
 * The `TileMetaChips` component (LobbyPage.tsx ~L2728) wraps the
 * eta + difficulty pills in a `<div class="tile-chips">`. The
 * wrapper carries an EXPLICIT `aria-hidden="false"` even though
 * that's the default — the explicitness exists so that if a
 * future refactor wraps the tile in a parent that flips
 * `aria-hidden="true"` (e.g. a skeleton or off-screen carousel
 * page), the inner chips can opt back in and keep their
 * `aria-label` / `title` text reachable to assistive tech.
 *
 * Dropping the attribute (or flipping it to "true") would silently
 * remove the difficulty `aria-label="Difficulty: easy|medium|hard"`
 * from the AX tree without breaking any layout test.
 *
 * Sibling W1244 (LobbyTileEtaTitle) pins the eta chip's `title`;
 * the WRAPPER's aria-hidden value had no dedicated coverage —
 * searching `Lobby*.test.tsx` for `tile-chips` returns nothing.
 *
 * Lives in a NEW SIBLING file per the same rationale as W874 /
 * W908 / W932 / W951 / W965 / W1244: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-chips wrapper aria-hidden (W1397)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders aria-hidden=\"false\" on every tile-chips wrapper", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every visible tile wraps its eta+difficulty pills in a
    // `<div class="tile-chips">`. Grab every wrapper so the
    // assertion can't be defeated by an off-by-one render path.
    const wrappers = document.querySelectorAll<HTMLElement>(
      "div.tile-chips",
    );
    expect(wrappers.length).toBeGreaterThan(0);

    for (const wrapper of Array.from(wrappers)) {
      // The attribute MUST be present and equal the literal
      // string "false" — not absent (default) and not "true".
      expect(wrapper.getAttribute("aria-hidden")).toBe("false");
    }
  });
});
