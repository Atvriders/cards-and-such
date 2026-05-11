import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3045 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `declare` attribute.
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
 * `declare` is a legacy HTML attribute whose only historical host was
 * the `<object>` element in HTML 4.01 — where it acted as a boolean
 * marker signalling that the `<object>` was a declaration of an
 * embedded resource rather than an instantiation of it. The attribute
 * was already obsolete in HTML5 (the `<object declare>` form is not
 * defined by the modern spec) and is meaningless on every other
 * element type. On a `<div role="tablist">` it is doubly invalid:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an `<object>` element nor a resource
 *     declaration, so there is no embedded plugin/applet/data binding
 *     to "declare".
 *  2. Validators (W3C Nu, html-validate, axe) flag `declare` on
 *     non-`<object>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `declare` (or `declare="declare"`) would imply the
 *     filter rail is an inert object declaration to be instantiated
 *     later, confusing tooling that introspects DOM provenance and
 *     any legacy HTML 4 parsers still wired to recognise the
 *     attribute.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `declare`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `declare`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `declare`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `declare` (HTML 4 `<object>` declaration marker).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `declare`.
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
 *    — none of them currently cover `declare`. A regression that
 *    added `declare` or `declare="declare"` (e.g. by mistakenly
 *    templating a legacy `<object>`-style attribute onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("declare") === false` AND
 * `track.getAttribute("declare") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `declare` with an empty value is still authored, and
 * any string value is a regression. The `getAttribute(...) === null`
 * check is belt-and-braces: the DOM spec guarantees `getAttribute`
 * returns `null` (not `""`) when the attribute is absent, so pinning
 * both forms catches any future jsdom/DOM divergence.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no declare attribute (W3045)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a declare attribute", () => {
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

    // The pin: NO declare attribute is authored on the chip strip.
    // A regression that adds `declare`, `declare="declare"`, or any
    // other legacy HTML 4 `<object>`-style declaration binding would
    // fail here.
    expect(track!.hasAttribute("declare")).toBe(false);
    expect(track!.getAttribute("declare")).toBeNull();
  });
});
