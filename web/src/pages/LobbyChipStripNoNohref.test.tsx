import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3019 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `nohref` attribute.
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
 * `nohref` is a legacy HTML attribute whose only historical host
 * was the `<area>` element inside an image map (`<map>`). In HTML 3.2
 * / HTML 4.01 transitional it signalled that a given `<area>` shape
 * had no hyperlink destination — i.e. that clicking the hotspot
 * should be a no-op. The attribute was deprecated in HTML 4.01 and
 * removed entirely from the HTML5 specification; modern user agents
 * silently ignore it everywhere. On a `<div role="tablist">` it is
 * doubly meaningless:
 *  1. The chip strip is not an `<area>` element, so the original
 *     image-map "no hyperlink" semantics cannot apply.
 *  2. The chip strip is not a hyperlink-bearing element at all — it
 *     carries no `href`, so there is nothing for `nohref` to negate.
 *  3. Validators (W3C Nu, html-validate, axe) flag `nohref` on
 *     non-`<area>` elements (and indeed on ANY HTML5 element) as an
 *     unknown/obsolete attribute, polluting CI accessibility reports.
 *  4. A stray `nohref` (or `nohref=""`) would imply the filter rail
 *     was once intended to be a clickable image-map hotspot, confusing
 *     tooling that introspects DOM provenance (e.g. legacy-attribute
 *     scrapers, HTML4-era migration linters).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `nohref`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `nohref`.
 *  - W2889 (LobbyChipStripNoHref) pins absence of `href` — the
 *    POSITIVE hyperlink-target attribute. `nohref` is the legacy
 *    NEGATIVE counterpart (image-map "no hyperlink") and is a
 *    distinct attribute name; a regression that authored `nohref`
 *    instead of `href` would slip past the W2889 pin.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy quote-source URL attribute, silent on `nohref`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` —
 *    another image-map-era attribute (hotspot geometry). `coords`
 *    described WHERE a hotspot was; `nohref` described that a hotspot
 *    had no destination. They are orthogonal: a regression could add
 *    `nohref` without `coords` (or vice versa).
 *  - W?  (LobbyChipStripNoShape) pins absence of `shape` — the
 *    third image-map-era `<area>` attribute. Again orthogonal.
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoAriaAtomic, NoAriaBusy, NoAriaChecked,
 *    NoAriaControls, NoAriaCurrent, NoAriaDescribedBy, NoAriaDisabled,
 *    NoAriaExpanded, NoAriaHaspopup, NoAriaKeyshortcuts, NoAriaLive,
 *    NoAriaModal, NoAriaOrientation, NoAriaPressed, NoAriaReadonly,
 *    NoAriaRelevant, NoAriaRequired, NoAriaRoleDescription,
 *    NoAriaSelected, NoCite, NoCoords, NoMethod, NoAction, NoUsemap,
 *    NoShape) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover `nohref`. A regression
 *    that added `nohref` (e.g. by mistakenly templating a legacy
 *    image-map "no-hyperlink" attribute onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("nohref") === false` AND
 * `track.getAttribute("nohref") === null`. Both checks together
 * defend against the two regression shapes: a present-but-empty
 * `nohref=""` (caught by `hasAttribute`) and any string value
 * `nohref="nohref"` / `nohref="true"` (caught by `getAttribute`
 * returning non-null).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no nohref attribute (W3019)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a nohref attribute", () => {
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

    // The pin: NO nohref attribute is authored on the chip strip.
    // `nohref` is an obsolete HTML4-era <area> attribute with no
    // defined semantics on a <div>; a regression that added
    // `nohref` (with or without a value) would fail here.
    expect(track!.hasAttribute("nohref")).toBe(false);
    expect(track!.getAttribute("nohref")).toBeNull();
  });
});
