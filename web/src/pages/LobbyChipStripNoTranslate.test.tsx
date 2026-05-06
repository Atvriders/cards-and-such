import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2834 — the chip-strip tablist track (`.lobby-chips`) MUST NOT carry
 * a `translate` attribute. The track is the inner `<div role="tablist">`
 * rendered around line 2623-2630 of LobbyPage.tsx:
 *
 *   <div
 *     ref={trackRef}
 *     className="lobby-chips"
 *     role="tablist"
 *     aria-label="Filter by category"
 *   >
 *     {children}
 *   </div>
 *
 * `translate` is a global HTML attribute (values: "yes" or "no") used
 * to opt-in/out of automatic translation by tools such as Google
 * Translate. Its DEFAULT (and inherited) state for any element is
 * "yes" (translate). The chip-strip track itself contains no direct
 * text content — only chip <button> children — and the surrounding
 * page already operates under the document-level translation policy.
 *
 * Sibling pins on the same `.lobby-chips` track already cover other
 * attribute-shape contracts:
 *   - W1908 / LobbyChipStripTag.test.tsx pins `tagName === "DIV"`.
 *   - W1150 / LobbyChipStripAria.test.tsx pins `aria-label` and `role`.
 *   - W2036 / LobbyChipStripNoId.test.tsx pins absence of `id`.
 *   - W2228 / LobbyChipStripNoTabindex.test.tsx pins absence of `tabindex`.
 *   - LobbyChipStripNoStyle.test.tsx pins absence of inline `style`.
 *   - LobbyChipStripNoLang.test.tsx pins absence of `lang`.
 *   - LobbyChipStripNoDir.test.tsx pins absence of `dir`.
 *   - LobbyChipStripNoSpellcheck.test.tsx pins absence of `spellcheck`.
 *
 * What none of those cover is the ABSENCE of a `translate` attribute.
 * A future refactor that added e.g. `translate="no"` would silently:
 *   1. Block per-element translation override at the chip-strip level,
 *      preventing accessibility tools and i18n machinery from picking
 *      up category labels rendered by chip children if/when those
 *      labels become user-visible (chip glyphs aside).
 *   2. Or, with `translate="yes"`, redundantly assert the inherited
 *      default and create a no-op attribute that nonetheless changes
 *      the DOM-attribute snapshot consumed by visual-regression and
 *      a11y-snapshot tooling downstream.
 *   3. Couple chip-strip translation behaviour to the wrapper element
 *      rather than to either the document root or to the individual
 *      chip children where it actually belongs.
 *
 * One focused assertion: the `.lobby-chips` tablist track MUST NOT
 * carry a `translate` attribute at all. If a future change deliberately
 * needs one, it should add it AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 / W2228 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip track has no translate attribute (W2834)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips tablist track does NOT carry a translate attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector (rather than
    // getByRole) avoids ambiguity with the sibling drawer tablist that
    // shares role="tablist", and the className itself is independent
    // of the attribute under test.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: confirm we pinned the inner track and not, say, a
    // `.lobby-chips-arrow` overflow button (which has the chained
    // className) or the outer `.lobby-chips-wrap`. Without this guard
    // a future restructure that moved the className onto a wrapper
    // could pass this assertion vacuously.
    expect(strip!.tagName).toBe("DIV");
    expect(strip!.getAttribute("role")).toBe("tablist");

    // The actual contract: no `translate` attribute on the chip-strip
    // track. Use `hasAttribute` rather than checking for a specific
    // value — both `translate="yes"` and `translate="no"` are
    // meaningful overrides that this pin disallows.
    expect(strip!.hasAttribute("translate")).toBe(false);
  });
});
