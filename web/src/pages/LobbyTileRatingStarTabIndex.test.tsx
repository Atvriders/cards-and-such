import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1543 — every star <button> inside the lobby tile-rating widget carries
 * `tabIndex={-1}`, removing it from the natural Tab-key sequence.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons:
 *   - W951  (LobbyTileRatingStars.test.tsx): `is-filled` count + `disabled`.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star `aria-checked`.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag/class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): explicit `type="button"`.
 *   - W682  (LobbyPage.test.tsx ~L2550): wrapper-span aria-label.
 *
 * None of those drill into the per-star `tabIndex` attribute. It matters
 * because:
 *
 *   1. The lobby tile is the natural Tab stop (the outer <a>/grid roving
 *      tabindex owns focus). If individual stars were also Tab-reachable
 *      (tabIndex=0 or default), Tab from one tile would land on five
 *      stars before reaching the next tile — flooding keyboard users with
 *      five "N stars" announcements per game card on every tab press.
 *
 *   2. The widget is a `radiogroup` (StarRating.tsx ~L148, ~L154). Per
 *      the WAI-ARIA radiogroup pattern, the GROUP is the single Tab stop
 *      and Arrow keys move between radios — not Tab. StarRating.tsx
 *      enforces this by stamping `tabIndex={-1}` on every star button
 *      (~L168) so they're focusable programmatically (for hover-via-focus
 *      preview, ~L170) but skipped by the Tab key.
 *
 * A regression that dropped the attribute (e.g. removing the explicit
 * `tabIndex={-1}` and letting `<button>` default to tabIndex=0) would
 * silently break the radiogroup pattern AND inject five extra Tab stops
 * per visible tile-rating widget across the entire lobby.
 *
 * `pool-10ball` reuses the same fixture id as the W682/W951/W1262/W1370/
 * W1530 sibling tests: not a FEATURED game, so its tile renders exactly
 * once under the canonical `tile-<id>` testid.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951/W1262/W1370/W1530: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-rating star buttons carry tabIndex=-1 (W1543)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all 5 star buttons with tabIndex=-1 (skipped by Tab key)", async () => {
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

    // Five radio-role star buttons regardless of rating
    // (StarRating.tsx ~L156-196).
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // Every star MUST carry tabIndex=-1 — StarRating.tsx ~L168. This is
    // the canonical WAI-ARIA radiogroup pattern: the group is the single
    // Tab stop, Arrow keys move between radios. A regression that dropped
    // the explicit attribute would default <button> to tabIndex=0 and
    // inject five extra Tab stops per visible rating widget.
    for (const star of stars) {
      expect(star.tabIndex).toBe(-1);
    }
  });
});
