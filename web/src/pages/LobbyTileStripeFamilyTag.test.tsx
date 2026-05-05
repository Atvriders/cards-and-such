import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2500 — pin the tagName ("SPAN") of a FAMILY-aggregate tile's
 * `.tile-stripe` decorative gradient element.
 *
 * The family aggregate `FamilyCard` (LobbyPage.tsx ~L3215) renders a
 * `<button type="button" class="tile tile--cat-... tile--family" ...>`
 * whose first child is `<span className="tile-stripe" aria-hidden="true" />`
 * (LobbyPage.tsx L3228). The CSS in LobbyPage.css keys the gradient
 * sweep off `.tile .tile-stripe`, but more importantly the layout
 * assumes an INLINE element so the stripe absolutely-positions inside
 * the tile button without forcing a block-level reflow of the
 * surrounding meta row.
 *
 * Sibling W2440 (LobbyTileStripeFamilyAria) pins the family-tile
 * stripe's `aria-hidden="true"` attribute via the same
 * `button.tile.tile--family:not(.tile--featured)` selector, but does
 * NOT assert tagName. The solo-card sibling W1838
 * (LobbyTileStripeTag) walks `[data-testid^="tile-"]` filtered by
 * `^tile-\d+$` OR `^tile-fam-` — empirically only `tile-2048` matches
 * `^tile-\d+$` and no element carries a `tile-fam-` testid (family
 * aggregates use `tile-${family.id}` like `tile-klondike`,
 * `tile-freecell`, `tile-spider`, `tile-wordle-family`). So the
 * family-aggregate button stripe tagName is NEVER reached by the
 * existing tag assertion. Silently re-tagging the family stripe as a
 * `<div>` (or any block element) would shift sibling layout in every
 * family card on the lobby (poker, solitaire variants, etc.) without
 * any existing assertion catching it.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1373 / W1838 / W2440: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — family-tile tile-stripe tagName (W2500)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders a family-tile button's `.tile-stripe` element with tagName === \"SPAN\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate a family-aggregate tile by selecting buttons carrying
    // the `tile--family` class WITHOUT `tile--featured` (the latter
    // is the featured-row family anchor branch at L3367, structurally
    // distinct). Filtering by parent <button> + class isolates the
    // family-aggregate branch (L3215) that no existing tile-stripe
    // tag test reaches.
    const familyButtons = document.querySelectorAll<HTMLButtonElement>(
      'button.tile.tile--family:not(.tile--featured)',
    );
    expect(
      familyButtons.length,
      "no family-aggregate tile buttons rendered",
    ).toBeGreaterThan(0);

    // Pick the first family-aggregate button and drill into its direct
    // `.tile-stripe` child element. The stripe is rendered as the first
    // child of the button (LobbyPage.tsx L3228).
    const firstFamily = familyButtons[0]!;
    const stripe = firstFamily.querySelector<HTMLElement>(
      ":scope > .tile-stripe",
    );
    expect(
      stripe,
      `family-tile button ${firstFamily.getAttribute("data-testid")} missing .tile-stripe child`,
    ).not.toBeNull();
    expect(stripe!.tagName).toBe("SPAN");
  });
});
