import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2062 — pin that the solo-card `.tile-stripe` decorative span is
 * rendered as a LEAF element (zero element children).
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2988 / ~L3228 /
 * ~L3381 / ~L3440) renders the stripe as the self-closing form
 * `<span className="tile-stripe" aria-hidden="true" />`. The stripe
 * is purely decorative chrome — the gradient sweep is painted by CSS
 * keyed off `.tile .tile-stripe` in LobbyPage.css. Because the span
 * is `aria-hidden="true"` and has no semantic content, it MUST stay
 * empty: any nested element (e.g. an icon, glyph, or text node added
 * by mistake) would either bleed through the aria boundary on some
 * screen-reader implementations OR shift the absolute-positioning
 * geometry the CSS depends on.
 *
 * Sibling tests pin the stripe's tagName === "SPAN" (W1838,
 * LobbyTileStripeTag), exact className === "tile-stripe" (W1705,
 * LobbyTileStripeClassEq), `aria-hidden="true"` (W1373,
 * LobbyTileStripeAria), and absence of an `id` (W2060,
 * LobbyTileStripeNoId). NONE of these existing assertions catch a
 * regression that nests an element inside the stripe — class/tag/aria
 * all still pass when the stripe becomes
 * `<span class="tile-stripe" aria-hidden="true"><i/></span>`.
 *
 * Grepping `Lobby*.test.tsx` for `tile-stripe` + (`childElementCount`
 * | `firstElementChild` | `children`) returns zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1373 / W1705 / W1838 / W2060: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-stripe is a leaf span (W2062)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-stripe` span with childElementCount === 0", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Every game tile renders a `tile-<id>` testid on the inner Link
    // root. From there, locate the immediate `.tile-stripe` child.
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let checked = 0;
    for (const tile of Array.from(tiles)) {
      // Skip nested tile chrome that shares the `tile-` prefix
      // (`tile-rating-*`, `tile-eta-*`, `tile-fav-marker-*`, etc.)
      // and skeletons; only inspect real solo-card roots.
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-\d+$/.test(testid) && !/^tile-fam-/.test(testid)) continue;

      const stripe = tile.querySelector<HTMLElement>(":scope > .tile-stripe");
      expect(stripe, `tile ${testid} missing direct .tile-stripe child`).not.toBeNull();
      // Pin the stripe as a LEAF element — no element children, ever.
      expect(stripe!.childElementCount).toBe(0);
      checked += 1;
    }

    // Sanity: at least one real tile was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
