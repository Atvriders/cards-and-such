import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2966 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `for` attribute.
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
 * `for` is a legacy/specialized HTML attribute whose only valid hosts
 * are `<label>` (where it points to the `id` of the labeled form
 * control) and `<output>` (where it lists the space-separated `id`s
 * of the elements whose values contributed to the calculation). On a
 * `<div role="tablist">` it is meaningless: no user agent, no screen
 * reader, and no spec consumer interprets `for` on a non-label /
 * non-output element. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a label nor an output, so there is no
 *     associated form control or computation source to bind to.
 *  2. Validators (W3C Nu, html-validate, axe) flag `for` on
 *     non-label/non-output elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `for="some-input-id"` would wire the tablist to a
 *     phantom control via the HTMLLabelElement interface, confusing
 *     accessibility tooling that walks label-for relationships and
 *     potentially stealing click activation from real labels.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `for`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `for`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `for`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `for` (label/output association).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `for`.
 *  - The broad family of LobbyChipStripNo* pins (NoForm, NoFormaction,
 *    NoFormenctype, NoFormmethod, NoFormtarget, NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoName,
 *    NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden, NoInert,
 *    NoSpellcheck, NoTranslate, NoContenteditable, NoAutocomplete,
 *    NoAutocapitalize, NoInputmode, NoHref, NoTarget, NoRel,
 *    NoDownload, NoAnchor, NoBlocking, NoElementtiming, NoExportparts,
 *    NoItemid, NoItemprop, NoItemref, NoItemscope, NoItemtype,
 *    NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCoords, NoMethod, NoAction, NoUsemap,
 *    NoShape, NoCite) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover `for`. Note in particular
 *    that NoForm pins absence of the `form` attribute (which binds
 *    a form-associated element to a `<form>` by id) — that is a
 *    different attribute from `for` (which binds a label/output to
 *    its target control(s)). A regression that added
 *    `for="category-input"` (e.g. by mistakenly templating a
 *    label-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("for") === false` AND
 * `track.getAttribute("for") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `for` with an empty value is still authored, and any
 * string value is a regression. We assert both predicates so a
 * regression that authored `for=""` (which `getAttribute` would still
 * return as the empty string, not null) is caught by the
 * `hasAttribute` half, and a regression that bypassed `setAttribute`
 * via some exotic IDL path is caught by the `getAttribute` half.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no for attribute (W2966)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a for attribute", () => {
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

    // The pin: NO for attribute is authored on the chip strip.
    // A regression that adds `for=""`, `for="some-input-id"`, or any
    // other label/output association binding would fail here.
    expect(track!.hasAttribute("for")).toBe(false);
    expect(track!.getAttribute("for")).toBeNull();
  });
});
