import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2273 — pin that the solo-card `.tile-stripe` decorative span is
 * rendered WITHOUT a `tabindex` attribute.
 *
 * Each tile (`GameCard` / `FamilyCard`, LobbyPage.tsx ~L2988) renders
 * `<span className="tile-stripe" aria-hidden="true" />` directly inside
 * the tile `<Link>` root. The stripe is purely decorative chrome keyed
 * off the `.tile-stripe` class in LobbyPage.css and is `aria-hidden`.
 * It MUST stay outside the keyboard tab order — adding `tabindex="0"`
 * (or even `tabindex="-1"`) would expose a non-interactive decorative
 * span to focus tooling and screen readers, contradicting its
 * `aria-hidden="true"` semantics and noisily inserting empty stops in
 * the lobby's keyboard nav. Sibling tests pin the class
 * (W1334 LobbyTileStripeClassEq), tag (LobbyTileStripeTag),
 * aria-hidden (W1373 LobbyTileStripeAria), id absence
 * (W2060 LobbyTileStripeNoId), role absence (LobbyTileStripeNoRole),
 * style absence (LobbyTileStripeNoStyle), and child absence
 * (LobbyTileStripeNoChildren), but no test pins the absence of a
 * `tabindex` attribute. Dropping `tabindex={0}` onto the span
 * accidentally would silently regress keyboard navigation across the
 * entire lobby grid without any existing assertion catching it.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W1244 / W1334 / W2060: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-stripe has no tabindex attribute (W2273)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-stripe` span without a `tabindex` attribute", async () => {
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
    // attribute (tabindex presence) rather than reasserting
    // class/tag/aria/id/role/style/children.
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
    expect(stripe!.hasAttribute("tabindex")).toBe(false);
  });
});
