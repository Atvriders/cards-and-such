import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2344 — pin that the solo-card `.tile-stripe` decorative span is
 * rendered WITHOUT a `title` attribute.
 *
 * Each tile (`GameCard` / `FamilyCard`, LobbyPage.tsx ~L2057 / ~L2988
 * / ~L3228 / ~L3381 / ~L3440) renders
 * `<span className="tile-stripe" aria-hidden="true" />` directly inside
 * the tile `<Link>` root. The stripe is purely decorative chrome keyed
 * off the `.tile-stripe` class in LobbyPage.css and is `aria-hidden`,
 * so it MUST stay free of any user-visible affordance. A `title`
 * attribute would surface a native browser tooltip on hover — directly
 * contradicting the `aria-hidden="true"` semantics, doubling-up on the
 * tile's own `aria-label`, and exposing accidental copy (e.g. an
 * internal class name pasted as `title="tile-stripe"`) to end users.
 *
 * Sibling tests pin the stripe's tagName === "SPAN"
 * (W1838 LobbyTileStripeTag), exact className === "tile-stripe"
 * (W1705 LobbyTileStripeClassEq), `aria-hidden="true"`
 * (W1373 LobbyTileStripeAria), absence of `id`
 * (W2060 LobbyTileStripeNoId), absence of `role`
 * (LobbyTileStripeNoRole), absence of `style`
 * (W2104 LobbyTileStripeNoStyle), absence of `tabindex`
 * (W2273 LobbyTileStripeNoTabindex), and `childElementCount === 0`
 * (W2062 LobbyTileStripeNoChildren). NONE of those assertions catches
 * a regression that adds `title="..."` onto the stripe — the class,
 * tag, aria, id, role, style, tabindex, and child-count checks all
 * still pass with `<span class="tile-stripe" aria-hidden="true"
 * title="tile stripe"/>`.
 *
 * Grepping `web/src/pages/Lobby*.test.tsx` for `tile-stripe` + `title`
 * returns zero matches, so this attribute is genuinely unpinned.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W1244 / W1334 / W2060 / W2273: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-stripe has no title attribute (W2344)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-stripe` span without a `title` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate a single solo-card tile root via the `tile-<id>` testid
    // pattern, then drill into its direct `.tile-stripe` child. Picking
    // exactly one stripe keeps this assertion focused on the untested
    // attribute (title presence) rather than reasserting
    // class/tag/aria/id/role/style/tabindex/children.
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    expect(tiles.length).toBeGreaterThan(0);

    let stripe: HTMLElement | null = null;
    for (const tile of Array.from(tiles)) {
      const testid = tile.getAttribute("data-testid") ?? "";
      if (!/^tile-\d+$/.test(testid) && !/^tile-fam-/.test(testid)) continue;
      stripe = tile.querySelector<HTMLElement>(":scope > .tile-stripe");
      if (stripe) break;
    }

    expect(stripe, "no solo-card tile-stripe span found").not.toBeNull();
    expect(stripe!.hasAttribute("title")).toBe(false);
  });
});
