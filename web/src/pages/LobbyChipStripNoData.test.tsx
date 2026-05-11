import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3043 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO bare `data` attribute.
 *
 * Note: this pins the bare attribute name `data` (as in
 * `hasAttribute("data")`), NOT the `data-*` family of custom data
 * attributes. The `data-*` namespace is HTML5's authored extension
 * point and is perfectly legitimate; a bare `data` attribute is not.
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
 * `data` is a legacy HTML attribute whose only valid host is
 * `<object>` — where it carries the URL of the embedded resource the
 * object element loads. On a `<div role="tablist">` it is meaningless:
 * no user agent, no screen reader, and no spec consumer interprets a
 * bare `data` attribute on a non-`<object>` element. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not an `<object>` embedding any external
 *     resource, so there is no data URL to point at.
 *  2. Validators (W3C Nu, html-validate, axe) flag bare `data` on
 *     non-`<object>` elements as an unknown attribute, polluting CI
 *     accessibility reports.
 *  3. A stray `data="https://example.com/resource"` would imply the
 *     filter rail embeds an external resource, confusing tooling that
 *     introspects DOM provenance (e.g. resource-graph extractors,
 *     CSP auditors, object-graph crawlers).
 *  4. `data` (bare) collides cognitively with the `data-*` namespace —
 *     a regression that wrote `data` instead of `data-foo` would
 *     silently break any code that expects the `data-*` convention.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `data`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `data`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `data`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `data` (object resource URL).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `data`.
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
 *    NoAriaSelected, NoCoords, NoCite, NoMethod, NoAction, NoUsemap,
 *    NoShape) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover bare `data`. A
 *    regression that added `data="https://..."` (e.g. by mistakenly
 *    templating an `<object>`-style attribute onto the tablist, or
 *    by typo'ing `data-foo` as `data`) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("data") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `data` with an empty value is still authored, and any
 * string value is a regression. We additionally assert
 * `getAttribute("data") === null` as a belt-and-braces guard against
 * any future DOM polyfill that diverges between the two predicates.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no data attribute (W3043)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a bare data attribute", () => {
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

    // The pin: NO bare data attribute is authored on the chip strip.
    // A regression that adds `data=""`, `data="https://example.com"`,
    // or any other resource URL binding would fail here. Note this
    // is the bare `data` attribute (legal only on <object>), NOT
    // any `data-*` custom attribute.
    expect(track!.hasAttribute("data")).toBe(false);
    expect(track!.getAttribute("data")).toBeNull();
  });
});
