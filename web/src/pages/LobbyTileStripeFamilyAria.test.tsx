import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2440 — pin the `aria-hidden="true"` attribute on a FAMILY-aggregate
 * tile's `.tile-stripe` decorative span.
 *
 * The family aggregate `FamilyCard` (LobbyPage.tsx ~L3215) renders a
 * `<button type="button" class="tile tile--cat-... tile--family" ...>`
 * whose first child is `<span className="tile-stripe" aria-hidden="true" />`.
 * That branch is structurally distinct from the solo `GameCard` branch
 * (which uses an anchor `<Link>` element, ~L2988) and the featured
 * family-anchor branch (~L3367, also a button but with the additional
 * `tile--featured` class).
 *
 * Sibling tile-stripe tests (W1373 LobbyTileStripeAria, W1705
 * LobbyTileStripeClassEq, W1838 LobbyTileStripeTag, W2060
 * LobbyTileStripeNoId, W2062 LobbyTileStripeNoChildren, W2104
 * LobbyTileStripeNoStyle, W2214 LobbyTileStripeNoRole, W2273
 * LobbyTileStripeNoTabindex, W2344 LobbyTileStripeNoTitle) all walk
 * `[data-testid^="tile-"]` and filter by `^tile-\d+$` OR `^tile-fam-`.
 * Empirically the only testid matching `^tile-\d+$` is `tile-2048`
 * (the sole game whose plugin id is purely numeric), and no element
 * carries a `tile-fam-` testid — so EVERY existing tile-stripe test
 * inspects only the solo `tile-2048` anchor stripe. The
 * family-aggregate button stripes (e.g. `tile-klondike`,
 * `tile-freecell`, `tile-spider`, `tile-wordle-family`,
 * `tile-abalone-family`, `tile-ancient-civilizations-trivia`) are
 * NEVER reached by those loops. Dropping `aria-hidden="true"` from
 * the family-tile stripe specifically would silently regress the
 * accessibility tree for every family card on the lobby (poker,
 * solitaire variants, etc.) without any existing assertion catching it.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1373 / W2344: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — family-tile tile-stripe aria-hidden (W2440)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders a family-tile button's `.tile-stripe` span with aria-hidden=\"true\"", async () => {
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
    // test reaches.
    const familyButtons = document.querySelectorAll<HTMLButtonElement>(
      'button.tile.tile--family:not(.tile--featured)',
    );
    expect(
      familyButtons.length,
      "no family-aggregate tile buttons rendered",
    ).toBeGreaterThan(0);

    // Pick the first family-aggregate button and drill into its direct
    // `.tile-stripe` child span. The stripe is rendered as the first
    // child element of the button (LobbyPage.tsx L3228).
    const firstFamily = familyButtons[0]!;
    const stripe = firstFamily.querySelector<HTMLElement>(
      ":scope > .tile-stripe",
    );
    expect(
      stripe,
      `family-tile button ${firstFamily.getAttribute("data-testid")} missing .tile-stripe child`,
    ).not.toBeNull();
    expect(stripe!.getAttribute("aria-hidden")).toBe("true");
  });
});
