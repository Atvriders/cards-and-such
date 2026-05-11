import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3067 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `alink` attribute.
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
 * `alink` is a deprecated legacy HTML attribute whose only historical
 * host was `<body>` — where it specified the colour of an active
 * hyperlink (a link being clicked) for the entire document. It was
 * removed in HTML5 in favour of CSS (`:active` pseudo-class on `<a>`).
 * On a `<div role="tablist">` it is meaningless: no user agent, no
 * screen reader, and no spec consumer interprets `alink` on a
 * non-body element. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body, so there are no global
 *     hyperlink colours to override here.
 *  2. Validators (W3C Nu, html-validate, axe) flag `alink` on
 *     non-body elements as an unknown/obsolete attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `alink="#ff0000"` would imply the filter rail is
 *     trying to style active-link colours via legacy HTML rather than
 *     CSS, confusing tooling that introspects DOM provenance and
 *     legacy-presentational-attribute scanners.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `alink`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `alink`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `alink`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `alink` (active-link colour).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote-source URL) and silent
 *    on `alink`.
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
 *    NoAriaSelected, NoCoords, NoMethod, NoAction, NoUsemap, NoShape,
 *    NoCite) each pin one specific global/legacy attribute's absence
 *    — none of them currently cover `alink`. A regression that added
 *    `alink="#ff0000"` (e.g. by mistakenly templating a body-style
 *    legacy presentational attribute onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("alink") === false`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `alink` with an empty value is still authored, and any
 * string value is a regression. We assert both for belt-and-braces
 * coverage.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no alink attribute (W3067)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an alink attribute", () => {
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

    // The pin: NO alink attribute is authored on the chip strip.
    // A regression that adds `alink=""`, `alink="#ff0000"`, or any
    // other legacy active-link colour binding would fail here.
    expect(track!.hasAttribute("alink")).toBe(false);
    expect(track!.getAttribute("alink")).toBeNull();
  });
});
