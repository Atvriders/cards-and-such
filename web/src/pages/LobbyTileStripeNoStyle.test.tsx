import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2104 — pin that the solo-card `.tile-stripe` decorative span is
 * rendered WITHOUT an inline `style` attribute.
 *
 * Each tile (`GameCard` / `FamilyCard`, LobbyPage.tsx ~L2988) renders
 * `<span className="tile-stripe" aria-hidden="true" />` directly inside
 * the tile `<Link>` root. All visual styling for the stripe lives in
 * LobbyPage.css keyed off the `.tile-stripe` class — there is no
 * inline `style` prop on the JSX. Sibling tests pin id absence
 * (W2060 LobbyTileStripeNoId), child absence (LobbyTileStripeNoChildren),
 * class (W1334 LobbyTileStripeClassEq), tag (LobbyTileStripeTag), and
 * aria-hidden (W1373 LobbyTileStripeAria), but no existing test pins
 * the absence of an inline `style` attribute. Adding inline styles
 * would defeat the CSS-only theming strategy and bypass the
 * `.tile-stripe` cascade rules without any assertion catching it.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W2060 / W1334: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — solo-card tile-stripe has no style attribute (W2104)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-stripe` span without an inline `style` attribute", async () => {
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
    // attribute (style presence) rather than reasserting class/tag/aria.
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
    expect(stripe!.hasAttribute("style")).toBe(false);
  });
});
