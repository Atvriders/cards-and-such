import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2860 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * an `exportparts` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover the
 * absence of `part` (LobbyChipStripNoPart) and a wide catalog of other
 * attribute-shape contracts (slot, lang, form, tabindex, id, style,
 * etc.). What none of those cover is the ABSENCE of the SHADOW-DOM
 * companion attribute `exportparts`.
 *
 * `exportparts` is the Shadow DOM "re-export" hook: when a custom
 * element is itself nested inside another shadow root, `exportparts`
 * forwards inner `part` names outward so an even-further-outside
 * stylesheet can target them via `::part()`. Like `part`, it is a
 * Web Components / Shadow DOM contract and has zero meaning on a
 * plain React-rendered `<div role="tablist">` living in the regular
 * document tree. A stray `exportparts="..."` on the strip would:
 *   1. Be silently inert in the current tree (no shadow host above
 *      it), creating misleading dead markup that implies a multi-
 *      level Shadow-DOM theming integration that does not exist.
 *   2. Become load-bearing the moment the lobby is ever embedded
 *      inside nested custom-element shells, where an outer
 *      stylesheet could suddenly grab the strip via `::part(...)`
 *      forwarded through this attribute and override layout in a
 *      hard-to-trace way.
 *   3. Confuse design-system / a11y audits that treat `exportparts`
 *      as a structural Shadow-DOM theming signal.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry an `exportparts` attribute at all. If a future change
 * deliberately adopts Shadow DOM theming here, it should add the
 * attribute AND update this pin in the same commit so the trade-off
 * is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoPart / LobbyChipStripNoSlot pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no exportparts attribute (W2860)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry an exportparts attribute", () => {
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

    // The actual contract: no `exportparts` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `exportparts=""` would
    // be flagged.
    expect(strip!.hasAttribute("exportparts")).toBe(false);
  });
});
