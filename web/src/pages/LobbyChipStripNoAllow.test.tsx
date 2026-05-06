import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2970 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `allow` attribute.
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
 * `allow` is an HTML attribute whose only valid host is `<iframe>` —
 * where it carries a serialized Permissions Policy directive list
 * (e.g. `allow="camera; microphone; geolocation"`) controlling which
 * browser features the embedded document may use. On a
 * `<div role="tablist">` it is meaningless: no user agent honours
 * `allow` outside of `<iframe>` (and historically `<fencedframe>`),
 * so it has no runtime effect on a div. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an embedded browsing context nor a
 *     fenced frame, so there is no Permissions Policy scope to
 *     delegate.
 *  2. Validators (W3C Nu, html-validate, axe) flag `allow` on
 *     non-iframe/non-fencedframe elements as an unknown/invalid
 *     attribute, polluting CI accessibility reports.
 *  3. A stray `allow="camera; microphone"` would imply the filter
 *     rail is a sandboxed embed delegating sensitive permissions,
 *     confusing tooling that introspects the DOM for embedded
 *     content (e.g. permission auditors, iframe scanners, CSP
 *     analyzers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its iframe-only attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `allow`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `allow`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `allow`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `allow` (Permissions Policy directive).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — the
 *    quote-source URL attribute, orthogonal to `allow`.
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
 *    — none of them currently cover `allow`. A regression that added
 *    `allow="camera; microphone"` (e.g. by mistakenly templating an
 *    iframe-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("allow") === false` plus
 * `track.getAttribute("allow") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an HTML attribute —
 * `allow` with an empty value is still authored, and any string
 * value is a regression. The paired `getAttribute(...) === null`
 * check is the DOM-level confirmation that no value was authored.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no allow attribute (W2970)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an allow attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO allow attribute is authored on the chip strip.
    // A regression that adds `allow=""`, `allow="camera; microphone"`,
    // or any other Permissions Policy directive would fail here.
    expect(track!.hasAttribute("allow")).toBe(false);
    expect(track!.getAttribute("allow")).toBeNull();
  });
});
