import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2479 — the SoloCard's footer CTA span (LobbyPage.tsx ~L3052) carries
 * the EXACT className `"tile-cta"` — no extra utility/state classes, no
 * BEM modifier, no whitespace padding. The span sits inside the
 * SoloCard's `.tile-foot` and reads:
 *
 *     <span className="tile-cta" aria-hidden="true">
 *       Play
 *       <svg …/>
 *     </span>
 *
 * Sibling pins already cover the OTHER `.tile-cta` contract bits on the
 * SoloCard (standalone, non-family) branch:
 *   - LobbyTilePlayCtaHidden.test.tsx (W1344) pins the SoloCard CTA's
 *     `aria-hidden="true"` (the L3052 branch, anchored on
 *     `texas-holdem`).
 *   - LobbyFamilyCta.test.tsx (W1314) pins the FAMILY CTA's text
 *     "Pick" (the L3291 branch, anchored on `klondike`) — does NOT
 *     touch the SoloCard branch.
 *   - LobbyTileCtaAriaHiddenExact.test.tsx (W2323) pins the FAMILY
 *     CTA's `aria-hidden="true"` exact value (L3291).
 *   - LobbyTileCtaNoTabindex.test.tsx (W2287) pins the FIRST-MATCH
 *     `.tile-cta`'s tabindex absence + tagName === "SPAN". Under the
 *     default mount the first match in document order is the
 *     FEATURED-strip CTA (LobbyPage.tsx ~L3479), not the SoloCard CTA
 *     at L3052 — those are separate JSX literals on independent code
 *     paths and a className regression on one would slip past the other.
 *   - LobbyTileCtaRecNoId.test.tsx (W2370) pins the RECOMMENDED-strip
 *     CTA's id absence (L2073).
 *
 * What none of those cover is the EXACT className value `"tile-cta"` on
 * the SoloCard's `.tile-cta` span. The CSS selector `.tile-cta` is the
 * only stylesheet hook that paints the footer's affordance pill — the
 * arrow-chevron color, hover transition, and right-side alignment all
 * key off this single class. Stamping additional classes (e.g.
 * `"tile-cta tile-cta--solo"` or `"tile-cta is-active"`) would silently:
 *   1. Couple sibling CSS to a modifier this codebase has not declared,
 *      breaking the painted pill the moment a stylesheet ships without
 *      the modifier rule.
 *   2. Diverge the SoloCard CTA from its sibling FamilyCard / Featured /
 *      Recommended CTAs — all four branches stamp the bare `"tile-cta"`
 *      string, and a divergence on one branch would surface as a
 *      visually-inconsistent footer across the lobby grid.
 *   3. Couple sibling tooling (querySelectorAll, axe rules, snapshot
 *      tests) to an attribute combination this codebase has
 *      deliberately not advertised.
 *
 * Pinning EXACT equality (`.className === "tile-cta"`) — rather than a
 * `.classList.contains("tile-cta")` substring check — guards against
 * BOTH directions: dropping the class AND adding extra classes
 * alongside it. The classList check would survive an addition
 * regression vacuously.
 *
 * `texas-holdem` is the canonical standalone (non-family, non-featured)
 * id reused by W248/W766/W789/W803/W874/W1344. Narrowing the grid via
 * the search box to that single tile keeps the within-tile `.tile-cta`
 * lookup unambiguous and isolates the SoloCard branch (L3052) from the
 * featured-strip branch (L3479) which uses different ids.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1344/W2287/W2323/W2370: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — solo tile-cta className exact value (W2479)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("solo-card .tile-cta carries className exactly equal to \"tile-cta\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to the canonical standalone tile (mirrors W874 /
    // W1344). With a search query active, the featured strip is
    // suppressed (LobbyPage.tsx ~L2000) so texas-holdem surfaces only
    // via its SoloCard grid tile and the within-tile `.tile-cta`
    // lookup is anchored on the L3052 branch.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // The footer CTA span sits inside the SoloCard's outer `<Link>`.
    // It contains the literal "Play" text + an arrow SVG.
    const cta = tile.querySelector<HTMLElement>(".tile-cta");
    expect(cta).not.toBeNull();

    // Belt-and-braces: confirm we're anchored on the SoloCard CTA
    // ("Play" — family CTA reads "Pick" per W1314), not some other
    // `.tile-cta` higher in the tree. A regression that swapped the
    // SoloCard branch for the FamilyCard branch would surface here
    // before the className assertion fires vacuously.
    expect(cta!.tagName).toBe("SPAN");
    expect(cta).toHaveTextContent(/^Play/);

    // The actual contract: EXACT string equality on the className
    // attribute. `=== "tile-cta"` rejects BOTH a dropped class AND any
    // additional/modifier classes (e.g. "tile-cta is-hot",
    // "tile-cta tile-cta--solo") — a `classList.contains` substring
    // check would survive the addition regression vacuously.
    expect(cta!.className).toBe("tile-cta");
    // Reflect the same contract via the markup attribute to guard
    // against IDL/attribute drift (e.g. SVGElement-on-HTMLElement
    // typing where `.className` is a `SVGAnimatedString` rather than a
    // plain string). The `.tile-cta` span here is plain HTML so both
    // forms agree, but pinning both surfaces intent.
    expect(cta!.getAttribute("class")).toBe("tile-cta");
  });
});
