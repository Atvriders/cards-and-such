import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3017 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `summary` attribute.
 *
 * The element's authored attribute set is intentionally minimal:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *
 * `summary` is a legacy HTML attribute whose only historical host was
 * `<table>`, where it described the table's contents/purpose for
 * non-visual user agents. It was OBSOLETE in HTML5 (removed in favor
 * of `<caption>` and `aria-describedby`) and is invalid on every
 * other element — including a `<div role="tablist">`. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a `<table>` and has no rows/columns to
 *     summarize, so the attribute is semantically meaningless here.
 *  2. Validators (W3C Nu, html-validate, axe) flag `summary` outside
 *     of legacy `<table>` contexts as an unknown/obsolete attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `summary="Category filter chips"` would duplicate the
 *     existing `aria-label="Filter by category"` semantics while
 *     adding nothing screen readers can consume — assistive tech does
 *     not announce `summary` on non-table elements.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `summary`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `summary`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `summary`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy quote-source URL attribute.
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCoords, NoCite, NoAxis, NoAbbr,
 *    NoBgcolor, NoBordercolor, NoCellpadding, NoCellspacing,
 *    NoCharset, NoCols, NoScrolling, NoShape, NoSize) each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `summary`. A regression that added
 *    `summary="..."` (e.g. by mistakenly templating a table-style
 *    description attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("summary") === false` AND
 * `track.getAttribute("summary") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `summary` with an empty value is still authored, and
 * any string value is a regression. Asserting both forms is
 * defense-in-depth.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no summary attribute (W3017)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a summary attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element. The pin only carries weight if the element
    // is in fact the role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO summary attribute is authored on the chip strip.
    // A regression that adds `summary=""`, `summary="Category filter
    // chips"`, or any other table-style description string would
    // fail here.
    expect(track!.hasAttribute("summary")).toBe(false);
    expect(track!.getAttribute("summary")).toBeNull();
  });
});
