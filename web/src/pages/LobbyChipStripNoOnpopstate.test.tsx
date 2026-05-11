import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3276 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpopstate` attribute.
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
 * `onpopstate` is a legacy inline event-handler attribute whose only
 * valid host is `<body>` (and the `Window` global it forwards to). It
 * fires when the active history entry changes (e.g. via back/forward
 * navigation) and is meaningless on any non-`<body>` element. On a
 * `<div role="tablist">` it is wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not the document body and never receives the
 *     `popstate` event. Authoring `onpopstate="..."` here would set an
 *     unknown HTML attribute that no user agent ever fires.
 *  2. Inline event-handler attributes are a CSP `unsafe-inline`
 *     hazard — pages with a strict script-src policy would either
 *     reject the handler outright or log a violation, polluting the
 *     console and the CSP report endpoint.
 *  3. Validators (W3C Nu, html-validate) flag `onpopstate` on
 *     non-`<body>` elements as an invalid attribute, polluting CI
 *     accessibility/HTML reports.
 *  4. A stray `onpopstate="navigateBack()"` would imply the filter
 *     rail itself handles history navigation, confusing tooling that
 *     introspects DOM event-handler provenance (e.g. SSR hydration
 *     diffs, security scanners, inline-handler auditors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` pins:
 *  - W1286 / W1330 / W1331 pin structural/aria details — none cover
 *    inline event handlers.
 *  - The broad family of LobbyChipStripNo* pins (NoCite, NoCoords,
 *    NoAccesskey, NoAutofocus, NoTabindex, NoLang, NoDir, NoId,
 *    NoStyle, NoForm, NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce,
 *    NoHidden, NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoMethod, NoAction, NoUsemap, NoShape)
 *    each pin one specific global/legacy attribute's absence — none
 *    of them currently cover `onpopstate`. A regression that added
 *    `onpopstate="..."` (e.g. by mistakenly templating a body-only
 *    event handler onto the tablist) would slip past every existing
 *    pin.
 *
 * The pin: `track.hasAttribute("onpopstate") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null` alone) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `onpopstate` with an empty value is still authored,
 * and any string value is a regression. Both are asserted for
 * defense in depth.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpopstate attribute (W3276)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpopstate attribute", () => {
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

    // The pin: NO onpopstate attribute is authored on the chip strip.
    // A regression that adds `onpopstate=""`, `onpopstate="goBack()"`,
    // or any other inline history-navigation handler would fail here.
    expect(track!.hasAttribute("onpopstate")).toBe(false);
    expect(track!.getAttribute("onpopstate")).toBeNull();
  });
});
