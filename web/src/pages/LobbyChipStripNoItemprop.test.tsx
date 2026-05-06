import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2862 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `itemprop` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoSlot.test.tsx,
 * LobbyChipStripNoLang.test.tsx, LobbyChipStripNoForm.test.tsx,
 * LobbyChipStripNoTabindex.test.tsx, LobbyChipStripNoId.test.tsx,
 * LobbyChipStripNoIs.test.tsx, etc. for the catalog: tag, aria, id,
 * style, child count, form, lang, slot, is, etc.). What none of those
 * cover is the ABSENCE of an `itemprop` attribute on the chip-strip
 * track itself.
 *
 * The `itemprop` attribute is the HTML Microdata hook that pairs an
 * element with a property name on the surrounding `itemscope`. The
 * lobby chip-strip is a plain React-rendered `<div role="tablist">`
 * that participates in zero microdata graphs — there is no enclosing
 * `itemscope`/`itemtype` on LobbyPage and the strip exposes navigation
 * UI rather than structured-data values. A stray `itemprop="..."` on
 * the strip would:
 *   1. Silently advertise the entire tablist (and its children) as a
 *      structured-data value to crawlers, microdata parsers, and the
 *      browser's microdata DOM API, even though the strip is interactive
 *      chrome with no semantic value to extract.
 *   2. Couple the strip to whatever schema the surrounding `itemscope`
 *      decides to declare, making future markup churn (adding an
 *      `itemscope` higher in the tree for an unrelated reason) silently
 *      change what gets surfaced to consumers of microdata.
 *   3. Pollute the a11y / SEO surface with a property name whose value
 *      (the concatenated chip labels) is meaningless out of context and
 *      could be picked up by Schema.org validators or rich-result tools
 *      as a malformed property.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry an `itemprop` attribute at all. If a future change deliberately
 * adopts microdata here, it should add the attribute AND update this
 * pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoSlot / LobbyChipStripNoIs pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no itemprop attribute (W2862)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an itemprop attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent of
    // the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not the outer
    // `.lobby-chips-wrap` or a `.lobby-chips-arrow` overflow button.
    // Without this guard a future restructure that moved the className
    // onto a wrapper could pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `itemprop` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `itemprop=""` would
    // be flagged.
    expect(strip!.hasAttribute("itemprop")).toBe(false);
  });
});
