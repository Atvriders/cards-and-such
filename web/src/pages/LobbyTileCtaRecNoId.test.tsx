import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2370 — the Recommended-strip tile's footer "Play" CTA span
 * (LobbyPage.tsx ~L2073) MUST NOT carry an `id` attribute. The CTA is
 * the decorative `<span className="tile-cta" aria-hidden="true">Play</span>`
 * rendered inside each `[data-testid^="rec-tile-"]` Link's `.tile-foot`:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pins already cover the OTHER `.tile-cta` branches and other
 * attributes:
 *   - LobbyTilePlayCtaHidden.test.tsx (W1344) pins the SoloCard CTA's
 *     `aria-hidden="true"` (the L3052 branch).
 *   - LobbyTileCtaAriaHiddenExact.test.tsx (W2323) pins the FAMILY CTA's
 *     `aria-hidden="true"` (the L3291 branch).
 *   - LobbyFamilyCta.test.tsx (W1314) pins the FAMILY CTA's text "Pick".
 *   - LobbyTileCtaNoTabindex.test.tsx (W2287) pins the FIRST `.tile-cta`
 *     span's `tabindex` absence and tagName === "SPAN" — under default
 *     state the first match is the FEATURED-strip CTA (L3479), not the
 *     recommended-strip CTA at L2073 because recommendations only surface
 *     after the user has played >=3 games (LobbyPage.tsx L1046).
 *   - LobbyTileFootNoId.test.tsx (W2230) pins the WRAPPER `.tile-foot`
 *     div's `id` absence — NOT the inner `.tile-cta` span this pin
 *     guards.
 *
 * What none of those cover is the absence of an `id` attribute on the
 * Recommended-strip's `.tile-cta` span specifically (the L2073 branch).
 * The CTA is purely decorative — it has no behavior, no programmatic
 * cross-reference, and is `aria-hidden="true"` so any `id` would be
 * dead weight at best, and at worst would couple sibling tooling
 * (anchor-link helpers, scrollIntoView targets, querySelector lookups)
 * to an attribute this codebase has deliberately not advertised. A
 * regression that stamped `id="tile-cta"` (e.g. while extracting a CSS
 * hook) would multiply duplicate ids across every recommended tile in
 * the strip — a hard HTML validity violation that no other pin catches.
 *
 * The Recommended strip is gated on `totalPlays >= 3` — see
 * LobbyPage.tsx L1046 — so the test seeds the stats blob with enough
 * play history to satisfy the gate before mount. The seed mirrors the
 * shape used by W2329 (LobbyTileAnchorAriaLabel.test.tsx) for the same
 * `cards-and-such:stats:v1` localStorage key.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1344/W2287/W2323: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — recommended tile-cta span has no id attribute (W2370)", () => {
  const STATS_KEY = "cards-and-such:stats:v1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("a [data-testid^=\"rec-tile-\"] tile's .tile-cta span does NOT carry an id attribute", () => {
    // Seed the stats blob BEFORE mount so the initial render satisfies
    // the recommendations gate (`totalPlays >= 3`, LobbyPage.tsx L1046)
    // and the recommender surfaces at least one tile in the strip. The
    // exact game ids chosen here aren't load-bearing — the recommender
    // is pure (web/src/games/recommend.ts) and any per-game seed >=3
    // total triggers the strip; we just need >=1 `rec-tile-*` node in
    // the DOM so the inner `.tile-cta` lookup is non-null.
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 5,
        totalWins: 0,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {
          "texas-holdem": { played: 5, wins: 0, best: 0 },
        },
        perCategory: { cards: 5 },
        daysPlayed: [],
        unlocked: [],
      }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // "Lobby is mounted" anchor used by sibling tests — confirms the
    // page rendered before we probe for the recommended strip.
    screen.getByPlaceholderText(/search/i);

    // The recommended strip wrapper is stamped with
    // `data-testid="lobby-recommended"` (LobbyPage.tsx L2040). With
    // totalPlays=5 and the recommender's surprise-slot fallback, the
    // strip MUST surface at least one `rec-tile-*` anchor — but the
    // exact id depends on registry contents. Pull the first one and
    // probe its inner `.tile-cta`.
    const recTile = document.querySelector<HTMLElement>(
      '[data-testid^="rec-tile-"]',
    );
    // Defensive: if for any reason the recommender returned no
    // candidates (e.g. registry shrunk to <2 games — extremely
    // unlikely), surface that as a precondition failure rather than a
    // vacuous pass. The strip's existence is the prerequisite for this
    // pin to mean anything.
    expect(recTile).not.toBeNull();

    // Locate the footer CTA span via the stable className. The L2073
    // branch is the ONLY `.tile-cta` rendered inside a `rec-tile-*`
    // anchor (rec tiles do not host the family Pick branch nor the
    // featured-strip branch), so `querySelector` here returns exactly
    // the L2073 span.
    const cta = recTile!.querySelector<HTMLElement>(".tile-cta");
    expect(cta).not.toBeNull();

    // Sanity anchor: confirm we landed on the CTA span itself (not a
    // wrapper) so the id-absence assertion below cannot pass vacuously
    // by binding to the wrong node. The text content "Play" also
    // distinguishes this from the family Pick branch (W1314).
    expect(cta!.tagName).toBe("SPAN");
    expect(cta).toHaveTextContent(/^Play/);

    // The actual contract: no `id` attribute on the recommended-strip
    // tile-cta span. `hasAttribute` rather than property access — the
    // DOM `id` IDL property reflects the empty string when no markup
    // attribute is present, so only `hasAttribute` distinguishes
    // "absent" from "explicitly empty".
    expect(cta!.hasAttribute("id")).toBe(false);
    // Belt-and-braces: if a regression sets `id=""` (empty string), the
    // hasAttribute check above would already fire, but pinning the
    // getAttribute return value as well surfaces the intent in the
    // failure message.
    expect(cta!.getAttribute("id")).toBeNull();
  });
});
