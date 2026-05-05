import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2214 — pin that the solo-card `.tile-stripe` decorative span is
 * rendered WITHOUT a `role` attribute.
 *
 * Each tile (`GameCard` / `FamilyCard`, LobbyPage.tsx ~L2988) renders
 * `<span className="tile-stripe" aria-hidden="true" />` directly inside
 * the tile `<Link>` root. The stripe is purely decorative chrome keyed
 * off the `.tile-stripe` class in LobbyPage.css; it is hidden from the
 * a11y tree via `aria-hidden="true"`. Adding an explicit `role`
 * (e.g. `role="presentation"` or worse, `role="separator"`) would
 * either be redundant with `aria-hidden` or actively reintroduce the
 * stripe into the accessibility tree as an interactive landmark, both
 * of which the current implementation correctly avoids by leaving the
 * span role-less. Sibling tests pin the class (W1334
 * LobbyTileStripeClassEq), tag (LobbyTileStripeTag), aria-hidden
 * (W1373 LobbyTileStripeAria), id absence (W2060
 * LobbyTileStripeNoId), inline-style absence (LobbyTileStripeNoStyle)
 * and child-less rendering (LobbyTileStripeNoChildren) — but no
 * existing test pins the absence of a `role` attribute.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W2060 / W1334: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — solo-card tile-stripe has no role attribute (W2214)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-stripe` span without a `role` attribute", async () => {
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
    // attribute (role presence) rather than reasserting class/tag/aria.
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
    expect(stripe!.hasAttribute("role")).toBe(false);
  });
});
