import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2858 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `is` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoSlot.test.tsx,
 * LobbyChipStripNoLang.test.tsx, LobbyChipStripNoForm.test.tsx,
 * LobbyChipStripNoTabindex.test.tsx, LobbyChipStripNoId.test.tsx, etc.
 * for the catalog: tag, aria, id, style, child count, form, lang, slot,
 * etc.). What none of those cover is the ABSENCE of an `is` attribute
 * on the chip-strip track itself.
 *
 * The `is` attribute is the Custom Elements v1 hook that upgrades a
 * built-in element (e.g. `<div is="x-foo">`) into a customized built-in
 * element registered via `customElements.define(name, ctor, { extends })`.
 * The lobby chip-strip is a plain React-rendered `<div role="tablist">`
 * with no associated custom-element constructor. A stray `is="..."` on
 * the strip would:
 *   1. Trigger a customized-built-in upgrade attempt against whatever
 *      name was supplied — silently no-op today (no registry entry) but
 *      a latent foot-gun the moment any code registers that name.
 *   2. Pin the element type to a customized-built-in semantics in the
 *      a11y tree and devtools, misrepresenting an otherwise vanilla
 *      tablist.
 *   3. Break Safari, which has historically not implemented `is=` for
 *      customized built-ins, producing inconsistent cross-browser
 *      behaviour for what should be a plain `<div>`.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry an `is` attribute at all. If a future change deliberately
 * adopts a customized built-in here, it should add the attribute AND
 * update this pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoSlot / LobbyChipStripNoLang pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no is attribute (W2858)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an is attribute", () => {
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

    // The actual contract: no `is` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `is=""` would
    // be flagged.
    expect(strip!.hasAttribute("is")).toBe(false);
  });
});
