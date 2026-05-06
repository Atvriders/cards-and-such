import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2931 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `min` attribute.
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
 * `min` is a form-control HTML attribute whose only valid hosts are
 * `<input>` (numeric/date/time/range types) and `<meter>` — where it
 * declares the minimum acceptable value of the control. On a
 * `<div role="tablist">` it is meaningless: no user agent, no form
 * validator, and no spec consumer interprets `min` on a non-input /
 * non-meter element. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a numeric input nor a meter, so there
 *     is no minimum-value semantic to carry.
 *  2. Validators (W3C Nu, html-validate, axe) flag `min` on
 *     non-input/non-meter elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `min="0"` would imply the filter rail is a constrained
 *     numeric control, confusing tooling that introspects DOM form
 *     semantics (e.g. constraint-validation extractors, automated
 *     form scrapers, accessibility auditors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its form-control attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `min`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `min`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `min`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `min` (form-control minimum value).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `min`.
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
 *    NoCite) each pin one specific global/legacy/form attribute's
 *    absence — none of them currently cover `min`. A regression that
 *    added `min="0"` (e.g. by mistakenly templating an input-style
 *    constraint attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("min") === false` AND
 * `track.getAttribute("min") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a form-control
 * HTML attribute — `min` with an empty value is still authored, and
 * any string value is a regression. We additionally pin
 * `getAttribute("min") === null` as a belt-and-suspenders check that
 * jsdom's attribute lookup also reports absence.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no min attribute (W2931)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a min attribute", () => {
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

    // The pin: NO min attribute is authored on the chip strip.
    // A regression that adds `min=""`, `min="0"`, or any other
    // numeric-constraint binding would fail here.
    expect(track!.hasAttribute("min")).toBe(false);
    expect(track!.getAttribute("min")).toBeNull();
  });
});
