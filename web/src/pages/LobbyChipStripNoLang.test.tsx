import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2830 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `lang` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2625 of LobbyPage.tsx.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts (see LobbyChipStripNoForm.test.tsx,
 * LobbyChipStripNoTabindex.test.tsx, LobbyChipStripNoId.test.tsx, etc.
 * for the catalog: tag, aria, id, style, child count, form, etc.).
 * What none of those cover is the ABSENCE of a `lang` attribute on
 * the chip-strip track itself.
 *
 * The `lang` attribute is HTML's natural-language hook — it tells
 * assistive tech and the browser which spoken/written language a
 * subtree contains, and overrides the document-level `lang` on
 * <html>. The chip-strip is a structural `<div role="tablist">` whose
 * tab labels are localized via the app's i18n layer at the document
 * root, not pinned to a single language at the strip level. A stray
 * `lang="..."` attribute on the strip would:
 *   1. Force assistive tech to switch voice/pronunciation profiles
 *      mid-page even when the labels match the document language,
 *      degrading the screen-reader experience.
 *   2. Lock the strip to one language, silently breaking translations
 *      that swap the document `lang` at runtime.
 *   3. Signal to tooling that this subtree is a language island, which
 *      it is not — it's a tab control inheriting the page language.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `lang` attribute at all. If a future change deliberately
 * needs one (extremely unlikely on a tablist), it should add it AND
 * update this pin in the same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoForm / LobbyChipStripNoTabindex pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no lang attribute (W2830)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a lang attribute", () => {
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

    // The actual contract: no `lang` attribute on the chip-strip
    // track. Use `hasAttribute` so even an empty `lang=""` would
    // be flagged.
    expect(strip!.hasAttribute("lang")).toBe(false);
  });
});
