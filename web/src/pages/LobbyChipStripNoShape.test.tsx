import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2896 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `shape` attribute. The track is the inner `<div role="tablist">`
 * rendered inside the chip-strip wrapper on LobbyPage.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoSlot.test.tsx,
 * LobbyChipStripNoLang.test.tsx, LobbyChipStripNoForm.test.tsx,
 * LobbyChipStripNoTabindex.test.tsx, LobbyChipStripNoId.test.tsx,
 * etc., for the catalog: tag, aria, id, style, child count, form,
 * lang, slot, etc.). What none of those cover is the ABSENCE of a
 * `shape` attribute on the chip-strip track itself.
 *
 * The legacy HTML `shape` attribute is a presentational hint defined
 * for `<a>` and `<area>` (with values like `rect`, `circle`, `poly`,
 * `default`) that historically influenced image-map hit-testing. It
 * has no defined meaning on a generic `<div>` — let alone on a
 * `<div role="tablist">` that backs the lobby chip strip. A stray
 * `shape="..."` on the strip would:
 *   1. Be silently inert in the current tree (a `<div>` ignores it),
 *      creating misleading dead markup that suggests an image-map
 *      or anchor-link relationship that does not exist.
 *   2. Mislead authoring-tools, linters, and a11y reviewers who
 *      reasonably read `shape` as a hit-testing or geometric hint
 *      and waste cycles chasing a non-existent contract.
 *   3. Become load-bearing the moment the strip is ever swapped to a
 *      true anchor element or area-bearing element, where `shape`
 *      would suddenly start affecting hit-region semantics that the
 *      tablist contract never opted into.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `shape` attribute at all. If a future change deliberately
 * introduces a meaningful `shape` here, it should add the attribute
 * AND update this pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoSlot / LobbyChipStripNoLang / LobbyChipStripNoForm
 * pattern so the test shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no shape attribute (W2896)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a shape attribute", () => {
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

    // The actual contract: no `shape` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `shape=""` would
    // be flagged.
    expect(strip!.hasAttribute("shape")).toBe(false);
  });
});
