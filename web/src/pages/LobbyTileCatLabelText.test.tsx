import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1788 — pin the EXACT visible LABEL text-node value rendered by every
 * solo-card / family-card tile's `.tile-cat` category-chip span. The
 * label is the trailing text node sourced from the `CATEGORY_LABELS`
 * lookup table inside `LobbyPage.tsx` (~L607):
 *
 *   const CATEGORY_LABELS: Record<GameCategory, string> = {
 *     solitaire: t("lobby.cat.solitaire"),  // "Solitaire"
 *     cards:     t("lobby.cat.cards"),      // "Cards"
 *     dice:      t("lobby.cat.dice"),       // "Dice"
 *     board:     t("lobby.cat.board"),      // "Board"
 *     arcade:    t("lobby.cat.arcade"),     // "Arcade"
 *   };
 *
 * Each tile renders:
 *
 *   <span className="tile-cat tile-cat-<tag>">
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}     <-- THIS sibling text node
 *   </span>
 *
 * Sibling W1741 (LobbyTileCatClassEq) pins the parent span's
 * `className`. Sibling W1757 (LobbyTileCatTag) pins the parent's
 * `tagName === "SPAN"`. Sibling W1777 (LobbyTileCatGlyphText) pins the
 * INNER glyph's textContent against CATEGORY_GLYPHS. Sibling W1461 /
 * W1727 / W1767 cover the inner glyph's aria-hidden / className /
 * tagName. NONE of those tests assert that the visible LABEL text
 * sibling actually equals one of the CATEGORY_LABELS values — a
 * regression that emptied the label (e.g. dropping the
 * `{CATEGORY_LABELS[g.category]}` JSX expression) or that swapped the
 * lookup table to all blanks would silently pass every sibling
 * assertion while leaving the chip's visible category text empty.
 *
 * Pinning the label text-node against the exact CATEGORY_LABELS
 * value-set (one of "Solitaire", "Cards", "Dice", "Board", "Arcade")
 * guards against:
 *  - accidental empty-render regressions of the label JSX expression,
 *  - inadvertent swaps to a sibling category's label,
 *  - i18n key renames that no longer resolve (would yield the raw key
 *    `lobby.cat.solitaire` instead of `Solitaire`).
 *
 * Lives in a NEW SIBLING file per the same rationale as W1777 / W1757:
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat label text node (W1788)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-cat label as one of the CATEGORY_LABELS literals", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Source-of-truth value-set sourced verbatim from the i18n catalog
    // entries that back CATEGORY_LABELS. Pinning by VALUE catches an
    // i18n key-rename regression where the lookup keys still exist but
    // resolve to the raw key string instead of the human label.
    const EXPECTED_LABELS = new Set([
      "Solitaire",
      "Cards",
      "Dice",
      "Board",
      "Arcade",
    ]);

    // Walk UP from the inner glyph (already pinned by W1727) to the
    // tile-cat parent span — guarantees we only inspect actual
    // category-chip parents, not unrelated future siblings that
    // happen to share the `tile-cat` substring.
    const glyphs = document.querySelectorAll<HTMLElement>(
      ".tile-cat-glyph",
    );
    expect(glyphs.length).toBeGreaterThan(0);

    let checked = 0;
    for (const glyph of Array.from(glyphs)) {
      const parent = glyph.parentElement;
      expect(parent, "tile-cat-glyph must have a parent element").not.toBeNull();
      if (!parent) continue;

      // Compute the LABEL text by stripping the inner glyph's text
      // from the parent's textContent. This isolates the trailing
      // sibling text node from the leading glyph child without
      // assuming a specific DOM-walk shape (whitespace-only text
      // nodes inserted by future formatter passes would still pass).
      const fullText = (parent.textContent ?? "").trim();
      const glyphText = (glyph.textContent ?? "").trim();
      const label = fullText.startsWith(glyphText)
        ? fullText.slice(glyphText.length).trim()
        : fullText.replace(glyphText, "").trim();

      // Pin the EXACT label — must be a non-empty string drawn from
      // CATEGORY_LABELS. An empty label would indicate the JSX
      // expression `{CATEGORY_LABELS[g.category]}` regressed; an
      // un-resolved label like "lobby.cat.solitaire" would indicate
      // the i18n key was renamed without updating the lookup table.
      expect(label.length).toBeGreaterThan(0);
      expect(
        EXPECTED_LABELS.has(label),
        `tile-cat label ${JSON.stringify(label)} not in CATEGORY_LABELS value-set`,
      ).toBe(true);
      checked += 1;
    }

    // Sanity: at least one real chip label was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
