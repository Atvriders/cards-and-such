import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2872 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `itemid` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover the
 * adjacent attribute-shape contracts (see LobbyChipStripNoItemref,
 * LobbyChipStripNoItemscope, LobbyChipStripNoItemprop, etc. for the
 * broader microdata catalog: itemref, itemscope, itemprop, plus the
 * neighbouring HTML-level pins for is/slot/lang/form/exportparts/part).
 * What none of those cover is the ABSENCE of an `itemid` attribute on
 * the chip-strip track itself.
 *
 * The `itemid` attribute is part of the HTML Microdata vocabulary
 * (alongside `itemscope`, `itemtype`, `itemref`, `itemprop`). On an
 * element that is also an `itemscope` with a global-vocabulary
 * `itemtype`, `itemid` declares the global identifier (typically a
 * URL/URI) for that microdata item. The lobby chip-strip is a plain
 * presentational tablist with no microdata semantics whatsoever. A
 * stray `itemid="..."` on the strip would:
 *   1. Lie to microdata consumers (search engine crawlers, schema.org
 *      extractors) by claiming the strip identifies a globally-named
 *      item.
 *   2. Produce a malformed graph because there is no matching
 *      `itemscope` / `itemtype` here for the `itemid` to attach to.
 *   3. Add an unnecessary attribute to a hot, frequently-rendered
 *      element on the lobby's primary navigation surface.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry an `itemid` attribute at all. If a future change deliberately
 * publishes microdata here, it should add the attribute AND update
 * this pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoItemref / LobbyChipStripNoItemscope pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no itemid attribute (W2872)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an itemid attribute", () => {
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

    // The actual contract: no `itemid` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `itemid=""` would
    // be flagged.
    expect(strip!.hasAttribute("itemid")).toBe(false);
  });
});
