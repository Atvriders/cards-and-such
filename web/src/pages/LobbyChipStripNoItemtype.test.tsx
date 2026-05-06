import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2868 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `itemtype` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoIs.test.tsx,
 * LobbyChipStripNoSlot.test.tsx, LobbyChipStripNoLang.test.tsx,
 * LobbyChipStripNoForm.test.tsx, LobbyChipStripNoTabindex.test.tsx,
 * LobbyChipStripNoId.test.tsx, etc. for the catalog: tag, aria, id,
 * style, child count, form, lang, slot, etc.). What none of those
 * cover is the ABSENCE of an `itemtype` attribute on the chip-strip
 * track itself.
 *
 * The `itemtype` attribute is the Microdata vocabulary URL that pairs
 * with `itemscope` to declare a typed structured-data item (e.g.
 * `<div itemscope itemtype="https://schema.org/Thing">`). The lobby
 * chip-strip is a UI control surface (a category-filter tablist) and
 * carries no schema.org / Microdata semantics. A stray `itemtype` on
 * the strip would:
 *   1. Falsely advertise the tablist as a structured-data item to
 *      Microdata consumers (Google's Rich Results Test, schema.org
 *      crawlers, browser-level Microdata APIs), polluting the page's
 *      structured-data graph with a non-entity DOM node.
 *   2. Pair meaninglessly without an `itemscope` (per the HTML spec,
 *      `itemtype` is only valid alongside `itemscope`) — yielding a
 *      validator warning while still being parsed by lenient consumers.
 *   3. Lock the chip-strip's identity to a third-party vocabulary
 *      URL, making any future schema.org change a cross-cutting edit.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry an `itemtype` attribute at all. If a future change deliberately
 * adopts Microdata here, it should add `itemscope` + `itemtype` AND
 * update this pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoIs / LobbyChipStripNoSlot pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no itemtype attribute (W2868)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an itemtype attribute", () => {
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

    // The actual contract: no `itemtype` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `itemtype=""` would
    // be flagged.
    expect(strip!.hasAttribute("itemtype")).toBe(false);
  });
});
