import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1814 — pin the DOM NODE TYPE of every `.tile-cat` chip's TRAILING
 * label as a raw text node (`Node.TEXT_NODE`, nodeType === 3), at the
 * `lastChild` position of the parent span. The chip shape is:
 *
 *   <span className="tile-cat tile-cat-<tag>">
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}     <-- raw TEXT NODE, NOT an element
 *   </span>
 *
 * Sibling tests already pin:
 *  - W1757: tile-cat tagName === "SPAN"
 *  - W1741: tile-cat className equals canonical literal
 *  - W1788: trailing label text VALUE is one of CATEGORY_LABELS
 *  - W1802: glyph is firstElementChild AND childElementCount === 1
 *  - W1461 / W1727 / W1767 / W1777: glyph aria/className/tagName/text
 *
 * NONE of those assert the *NODE TYPE* of the trailing label — i.e.
 * that the label is rendered as a raw text node rather than wrapped
 * in another element. W1802 pins childElementCount === 1 (only one
 * element child), but a regression that wrapped the label in a
 * non-element node, OR that inserted a comment/CDATA node at the
 * lastChild slot, would still keep elementChildCount === 1 while
 * shifting the label off the lastChild position. Conversely, a
 * regression that re-ordered the JSX so the glyph (an ELEMENT, not a
 * text node) became the lastChild would leave the W1788 label-value
 * search passing (textContent search still finds the label) yet
 * break the icon-leading / text-trailing reading order in a way that
 * affects assistive-tech text traversal.
 *
 * Pinning `lastChild.nodeType === Node.TEXT_NODE` (3) closes that gap
 * by asserting the trailing position is a raw text node, exactly as
 * authored in the JSX template.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1788 /
 * W1802 / W1777: shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the LobbyPage.tsx
 * mega-file.
 */
describe("LobbyPage — tile-cat label is a trailing text node (W1814)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-cat lastChild as a Node.TEXT_NODE", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
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

      // The LAST CHILD of every tile-cat span MUST be a raw text node
      // (Node.TEXT_NODE === 3). The trailing `{CATEGORY_LABELS[...]}`
      // JSX expression renders directly as a text node sibling of the
      // glyph element. A regression that wrapped the label in a span
      // (e.g. <span>{CATEGORY_LABELS[g.category]}</span>) would shift
      // lastChild from a text node (nodeType 3) to an element node
      // (nodeType 1), and a regression that re-ordered the JSX to
      // place the glyph LAST would also flip lastChild to nodeType 1.
      const tail = parent.lastChild;
      expect(tail, "tile-cat must have a trailing child node").not.toBeNull();
      expect(
        tail!.nodeType,
        "tile-cat lastChild must be a raw text node (nodeType 3)",
      ).toBe(Node.TEXT_NODE);

      // Defensive: ensure the trailing text node carries non-empty
      // content so a regression that emptied the JSX expression to an
      // empty string (still a text node, still passes nodeType) is
      // caught here too without overlapping W1788's value-set check.
      expect(
        (tail!.nodeValue ?? "").trim().length,
        "tile-cat trailing text node must carry non-empty text",
      ).toBeGreaterThan(0);

      checked += 1;
    }

    // Sanity: at least one real chip was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
