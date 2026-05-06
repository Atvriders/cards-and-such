import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2866 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `itemref` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover the
 * adjacent attribute-shape contracts (see LobbyChipStripNoIs.test.tsx,
 * LobbyChipStripNoSlot.test.tsx, LobbyChipStripNoLang.test.tsx,
 * LobbyChipStripNoForm.test.tsx, LobbyChipStripNoExportparts.test.tsx,
 * LobbyChipStripNoPart.test.tsx, etc. for the broader catalog: tag,
 * role, aria-*, id, style, child count, form, lang, slot, exportparts,
 * part, popover, etc.). What none of those cover is the ABSENCE of an
 * `itemref` attribute on the chip-strip track itself.
 *
 * The `itemref` attribute is part of the HTML Microdata vocabulary
 * (along with `itemscope`, `itemtype`, `itemid`, `itemprop`). On an
 * element that is also an `itemscope`, `itemref` lists IDs of other
 * elements in the document that should be treated as additional
 * properties of the same item. The lobby chip-strip is a plain
 * presentational tablist with no microdata semantics whatsoever. A
 * stray `itemref="..."` on the strip would:
 *   1. Lie to microdata consumers (search engine crawlers, schema.org
 *      extractors) by claiming the strip is the scope-host of an item
 *      whose properties live in referenced sibling elements.
 *   2. Produce broken / orphaned property graphs because there is no
 *      matching `itemscope` here, so any consumer that follows the
 *      `itemref` IDs gets a malformed item.
 *   3. Add an unnecessary attribute to a hot, frequently-rendered
 *      element on the lobby's primary navigation surface.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry an `itemref` attribute at all. If a future change deliberately
 * publishes microdata here, it should add the attribute AND update
 * this pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoIs / LobbyChipStripNoSlot pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no itemref attribute (W2866)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an itemref attribute", () => {
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

    // The actual contract: no `itemref` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `itemref=""` would
    // be flagged.
    expect(strip!.hasAttribute("itemref")).toBe(false);
  });
});
