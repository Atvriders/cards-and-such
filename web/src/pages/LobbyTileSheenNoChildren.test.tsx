import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2380 — pin that the lobby tile's `.tile-sheen` decorative span is
 * rendered as a LEAF element (zero element children).
 *
 * Each `GameCard` / `FamilyCard` / recommended-row `<Link>`
 * (LobbyPage.tsx ~L2058 / ~L2989 / ~L3229 / ~L3382 / ~L3441) renders
 * the sheen as the self-closing form
 * `<span className="tile-sheen" aria-hidden="true" />`. The sheen is
 * purely decorative chrome — the sweep highlight is painted by CSS
 * keyed off `.tile:hover .tile-sheen` in LobbyPage.css. Because the
 * span is `aria-hidden="true"` and carries no semantic content, it
 * MUST stay empty: any nested element (an icon, glyph, or text node
 * added by mistake) would either bleed through the aria boundary on
 * some screen-reader implementations OR shift the absolute-positioning
 * geometry that the CSS sweep depends on.
 *
 * Sibling tests pin the sheen's tagName === "SPAN" (W1839,
 * LobbyTileSheenTag), exact className === "tile-sheen" (W1717,
 * LobbyTileSheenClassEq), `aria-hidden="true"` (W1389,
 * LobbyTileSheenAria), absence of an `id` (W2061,
 * LobbyTileSheenNoId), absence of inline `style` (W2162,
 * LobbyTileSheenNoStyle), absence of `role` (W2215,
 * LobbyTileSheenNoRole), and absence of `tabindex` (W2274,
 * LobbyTileSheenNoTabindex). NONE of these existing assertions catch
 * a regression that nests an element inside the sheen — tag, class,
 * aria, id, style, role, and tabindex all still pass when the sheen
 * becomes `<span class="tile-sheen" aria-hidden="true"><i/></span>`.
 *
 * Grepping `Lobby*.test.tsx` for `tile-sheen` + (`childElementCount`
 * | `firstElementChild` | `children`) returns zero matches, leaving
 * this leaf-element invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1389 / W1717 / W1839 / W2061 / W2062: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-sheen is a leaf span (W2380)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile's `.tile-sheen` span with childElementCount === 0", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every sheen span in the rendered lobby. Use the class
    // selector directly so all `.tile-sheen` instances (across solo
    // tiles, family tiles, recommended-row tiles, and featured tiles)
    // are inspected uniformly.
    const sheens = document.querySelectorAll<HTMLElement>(".tile-sheen");
    expect(sheens.length).toBeGreaterThan(0);

    for (const sheen of Array.from(sheens)) {
      // Pin the sheen as a LEAF element — no element children, ever.
      expect(sheen.childElementCount).toBe(0);
    }
  });
});
