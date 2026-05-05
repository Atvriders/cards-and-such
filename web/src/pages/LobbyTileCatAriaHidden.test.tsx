import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2201 — pin the ABSENCE of an `aria-hidden` attribute on every
 * solo-card / family-card tile's `.tile-cat` category-chip parent
 * span. Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2060 / ~L3001
 * / ~L3241 / ~L3389 / ~L3448) renders the chip as:
 *
 *   <div className="tile-meta">
 *     <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
 *       <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *       {CATEGORY_LABELS[g.category]}
 *     </span>
 *   </div>
 *
 * The OUTER `.tile-cat` span is intentionally NOT `aria-hidden` —
 * its trailing text node is the human-readable category label
 * ("Cards" / "Solitaire" / "Dice" / "Board" / "Arcade") that screen
 * readers MUST announce so a non-sighted user can hear which family a
 * tile belongs to. Only the INNER `.tile-cat-glyph` decorative emoji
 * carries `aria-hidden="true"` (pinned by W1461 /
 * LobbyTileCatGlyphAria.test.tsx) so the icon is skipped while the
 * label still reaches the accessibility tree.
 *
 * A future refactor that inadvertently bubbled `aria-hidden="true"`
 * up to the outer `.tile-cat` chip (e.g. by hoisting the attribute
 * out of the glyph onto the parent for "simplicity") would silently:
 *   1. Remove the visible category label from the accessibility tree
 *      entirely, since `aria-hidden` on a parent prunes the whole
 *      subtree from assistive technologies.
 *   2. Make every solo-card / family-card tile announce only its
 *      title and meta line, dropping the category context.
 *   3. Leave sighted users unaffected, so the regression would only
 *      surface in screen-reader audits — exactly the class of bug
 *      worth pinning automatically.
 *
 * Sibling pins on this same `.tile-cat` parent span:
 *   - W1741 / LobbyTileCatClassEq.test.tsx pins the EXACT className
 *     string "tile-cat tile-cat-<tag>".
 *   - W1757 / LobbyTileCatTag.test.tsx pins `tagName === "SPAN"`.
 *   - W2072 / LobbyTileCatNoId.test.tsx pins the absence of an `id`.
 *   - W2166 / LobbyTileCatNoStyle.test.tsx pins the absence of an
 *     inline `style` attribute.
 *   - W1788 / LobbyTileCatLabelText.test.tsx pins the trailing label
 *     text against `CATEGORY_LABELS`.
 *   - W1814 / LobbyTileCatLabelNode.test.tsx pins the lastChild as
 *     a raw text node.
 *   - W1802 / LobbyTileCatGlyphFirst.test.tsx pins glyph-first order.
 *
 * What none of those cover is the ABSENCE of `aria-hidden` on the
 * outer `.tile-cat` chip itself. The closest cousin, W1461 /
 * LobbyTileCatGlyphAria.test.tsx, pins `aria-hidden="true"` on the
 * INNER `.tile-cat-glyph` span, NOT the outer chip — grepping
 * `Lobby*.test.tsx` for `aria-hidden` assertions on a `.tile-cat`
 * (not `.tile-cat-glyph`) parent returns zero matches.
 *
 * One focused assertion: a `.tile-cat` chip span MUST NOT carry an
 * `aria-hidden` attribute. If a future change deliberately needs one
 * (e.g. a hidden-while-loading skeleton variant), it should add the
 * new attribute AND update this pin in the same commit, making the
 * a11y trade-off explicit and reviewable.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1741 / W1727 / W2072 / W2166 pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat chip span has no aria-hidden attribute (W2201)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the first .tile-cat chip span does NOT carry an aria-hidden attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The search input is the canonical "lobby is ready" anchor used
    // by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Walk UP from a W1727-pinned glyph to its parent chip span,
    // guaranteeing we inspect an actual category-chip span (not an
    // unrelated future sibling that happens to share the `tile-cat`
    // substring like `.tile-cat-glyph`).
    const glyph = document.querySelector<HTMLElement>(".tile-cat-glyph");
    expect(glyph).not.toBeNull();

    const chip = glyph!.parentElement;
    expect(chip, "tile-cat-glyph must have a parent element").not.toBeNull();

    // Sanity: confirm we walked up onto an actual `.tile-cat` chip
    // (defensive against a future restructure that nests the glyph
    // one level deeper inside the chip).
    expect(chip!.classList.contains("tile-cat")).toBe(true);

    // Pin the ABSENCE of the `aria-hidden` attribute on the outer
    // chip. `hasAttribute("aria-hidden")` is the strictest check:
    // it returns `true` for any value (including the falsy
    // `aria-hidden="false"`), so any regression that surfaces the
    // attribute on the chip — regardless of value — is caught and
    // forces an explicit a11y review.
    expect(chip!.hasAttribute("aria-hidden")).toBe(false);
  });
});
