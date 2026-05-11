import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3039 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `codebase` attribute.
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
 * `codebase` is a legacy HTML attribute whose only historical hosts
 * were `<applet>` and `<object>` — where it carried a base URI for
 * resolving the `code`/`classid` of a Java applet or browser plugin.
 * Both `<applet>` and the `codebase` attribute were removed from HTML
 * with the deprecation of NPAPI plugins; modern user agents do not
 * interpret `codebase` on any element, and certainly not on a
 * `<div role="tablist">`. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not an embed point for a plugin/applet, so
 *     there is no plugin base URI to declare.
 *  2. Validators (W3C Nu, html-validate, axe) flag `codebase` on
 *     non-`<object>` elements as an unknown/obsolete attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `codebase="https://example.com/plugins/"` would imply
 *     the filter rail loads an external plugin, confusing tooling
 *     that introspects DOM provenance (e.g. plugin sandbox scanners,
 *     CSP auditors, security crawlers looking for legacy embeds).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `codebase`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `codebase`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `codebase`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `codebase` (plugin base URI).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quotation source URL) and
 *    silent on `codebase`.
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCite, NoCoords, NoMethod, NoAction,
 *    NoUsemap, NoShape) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover `codebase`.
 *    A regression that added `codebase="https://..."` (e.g. by
 *    mistakenly templating an applet/object attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("codebase") === false` plus
 * `track.getAttribute("codebase") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `codebase` with an empty value is still authored, and
 * any string value is a regression. The companion `getAttribute(...)
 * === null` check pins the read-shape too: tooling that branches on
 * `getAttribute("codebase")` (e.g. plugin scanners) must observe
 * `null`, not `""`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no codebase attribute (W3039)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a codebase attribute", () => {
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

    // The pin: NO codebase attribute is authored on the chip strip.
    // A regression that adds `codebase=""`,
    // `codebase="https://example.com/plugins/"`, or any other plugin
    // base-URI binding would fail here.
    expect(track!.hasAttribute("codebase")).toBe(false);
    expect(track!.getAttribute("codebase")).toBeNull();
  });
});
