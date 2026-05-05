import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2215 — pin the ABSENCE of any `role` attribute on every solo-card
 * tile's `.tile-sheen` decorative span.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2989) renders a
 * `<span className="tile-sheen" aria-hidden="true" />` immediately
 * inside the tile `<Link>` root. The sheen is purely-decorative
 * sweep-highlight chrome (keyed by `.tile:hover .tile-sheen` in
 * LobbyPage.css ~L706) — it deliberately carries NO ARIA role at all.
 * Adding any role (e.g. `role="presentation"`, `role="img"`, or — worst
 * — an interactive role like `role="button"`) would either redundantly
 * restate the existing `aria-hidden="true"` chrome semantics or
 * actively reintroduce the phantom announcement that aria-hidden was
 * added to suppress.
 *
 * Sibling tests pin the sheen's `aria-hidden` value (W1389) and exact
 * className equality (W1717), but the *non-presence* of `role` was
 * never asserted — grepping `Lobby*.test.tsx` for `tile-sheen` + `role`
 * returns zero matches. A regression that adds `role="presentation"`
 * (semantically redundant) or `role="img"` (semantically wrong: the
 * sheen has no graphical content, it's a CSS-only sweep) would slip
 * through every existing tile-sheen assertion silently.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1389 / W1717: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-sheen no role attribute (W2215)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-sheen` span without any `role` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the descendant `.tile-sheen` span.
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let checked = 0;
    for (const tile of Array.from(tiles)) {
      // Skip nested tile chrome that shares the `tile-` prefix
      // (`tile-rating-*`, `tile-eta-*`, `tile-fav-marker-*`, etc.)
      // and skeletons; only inspect real solo-card / family roots.
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-\d+$/.test(testid) && !/^tile-fam-/.test(testid)) continue;

      const sheen = tile.querySelector<HTMLElement>(":scope > .tile-sheen");
      expect(sheen, `tile ${testid} missing .tile-sheen child`).not.toBeNull();
      // The actual W2215 pin: NO `role` attribute on the sheen span.
      expect(
        sheen!.hasAttribute("role"),
        `tile ${testid} sheen unexpectedly has role="${sheen!.getAttribute("role")}"`,
      ).toBe(false);
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
