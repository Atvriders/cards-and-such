import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2188 — every star <button role="radio"> inside the lobby tile-rating
 * widget renders WITHOUT an inline `style` attribute. All visual styling
 * (size, fill, hover, focus, filled state) is delivered exclusively via
 * the `star-rating-star` / `is-filled` class hooks in StarRating.css.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons:
 *   - W951  (LobbyTileRatingStars.test.tsx): `is-filled` count + `disabled`.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star `aria-checked`.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): explicit `type="button"`.
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): per-star tabIndex=-1.
 *   - LobbyTileRatingStarRoleAttr / StarLabel / StarTagName: role / label / tag.
 *
 * None of those drill into the per-star `style` attribute. It matters
 * because:
 *
 *   1. Inline styles override the StarRating.css class cascade. A drift
 *      that started stamping `style={{ color: "..." }}` or `style={{
 *      width: "..." }}` on the buttons would silently defeat the theme
 *      tokens (filled vs. empty colour, sm vs. md sizing) and break the
 *      design-system contract.
 *
 *   2. Inline styles thwart CSP `style-src` hardening. The lobby renders
 *      under a strict CSP profile that forbids unhashed inline styles;
 *      stamping `style="..."` on a per-star basis would either trip CSP
 *      violations or force a `style-src 'unsafe-inline'` weakening.
 *
 *   3. The star button render (StarRating.tsx ~L160-194) explicitly omits
 *      a `style` prop today. This test pins that absence so a regression
 *      that introduces inline styling (e.g. adding hover-driven width
 *      tweaks via `style={{ width: ... }}`) is caught immediately.
 *
 * `pool-10ball` reuses the same fixture id as the W682/W951/W1262/W1370/
 * W1530/W1543 sibling tests: not a FEATURED game, so its tile renders
 * exactly once under the canonical `tile-<id>` testid and exposes the
 * `tile-rating-<id>` widget testid.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the W1543 sibling: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating star buttons carry no inline style attribute (W2188)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all 5 star buttons WITHOUT an inline `style` attribute", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings()
    // (LobbyPage.tsx ~L732).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the rating widget through its W682-pinned wrapper testid so
    // this test stays anchored on the same surface rather than drifting
    // to a sibling rating widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Five radio-role star buttons regardless of rating value
    // (StarRating.tsx ~L156-196).
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // Every star MUST omit the `style` attribute entirely. We assert
    // hasAttribute("style") rather than the computed style.cssText so a
    // regression that stamps an empty `style=""` placeholder is also
    // caught — the contract is "no inline style attribute, period."
    for (const star of stars) {
      expect(star.hasAttribute("style")).toBe(false);
    }
  });
});
