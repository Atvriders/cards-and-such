import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1802 — pin the SUB-ELEMENT ORDERING of every `.tile-cat` category
 * chip: the inner `.tile-cat-glyph` span MUST be the FIRST element
 * child (i.e., it appears BEFORE the trailing CATEGORY_LABELS text
 * node), AND the chip MUST contain exactly ONE element child (the
 * glyph) with the label living as a sibling text node.
 *
 *   <span className="tile-cat tile-cat-<tag>">
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>  <-- 1st
 *     {CATEGORY_LABELS[g.category]}                                      <-- text node
 *   </span>
 *
 * Sibling tests already pin:
 *  - W1757: tile-cat tagName === "SPAN"
 *  - W1741: tile-cat className equals canonical literal
 *  - W1788: trailing label text node is one of CATEGORY_LABELS
 *  - W1461: glyph aria-hidden === "true"
 *  - W1727: glyph className === "tile-cat-glyph"
 *  - W1767: glyph tagName === "SPAN"
 *  - W1777: glyph textContent equals CATEGORY_GLYPHS literal
 *
 * NONE of those assert the *positional relationship* between the
 * glyph element and the label text node. A regression that swapped
 * the JSX to render the label BEFORE the glyph (visual leading icon
 * → trailing icon), or that wrapped the label in a second element
 * child (breaking the "single-icon-leading-text" chip shape), would
 * silently pass every sibling assertion while visibly breaking the
 * chip's reading order — both for sighted users (icon-then-label
 * convention) and for fallback consumers that rely on element-child
 * count to distinguish a single-glyph chip from a multi-element
 * compound chip.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1788 /
 * W1777 / W1757: shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to LobbyPage.tsx.
 */
describe("LobbyPage — tile-cat glyph is first element child (W1802)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-cat-glyph span as the FIRST and ONLY element child of every tile-cat", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

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

      // The chip MUST contain exactly ONE element child (the glyph).
      // A regression that wrapped the label in a second <span> would
      // bump this to 2 and silently pass W1788's text-content check.
      expect(
        parent.childElementCount,
        "tile-cat must have exactly one element child (the glyph)",
      ).toBe(1);

      // The glyph MUST be the FIRST element child — i.e., it appears
      // BEFORE the trailing label text node in DOM order. A swap
      // that moved the glyph after the label (label-then-icon) would
      // still leave both pieces present (so W1788 / W1777 still
      // pass) but break the chip's icon-leading reading order.
      expect(
        parent.firstElementChild,
        "tile-cat-glyph must be the first element child of tile-cat",
      ).toBe(glyph);

      checked += 1;
    }

    // Sanity: at least one real chip was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
