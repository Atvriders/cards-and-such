import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3243 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncancel` attribute.
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
 * `oncancel` is the inline event-handler attribute for the
 * `cancel` event, which is fired on `<dialog>` elements (and
 * `<input type="file">` in some UA implementations) when a user
 * dismisses the dialog via the Escape key (or cancels a file
 * picker). It has no defined semantics on a `<div role="tablist">`:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a `<dialog>` nor a cancellable form
 *     control, so there is no `cancel` event to be fired on it.
 *  2. Inline event-handler content attributes (`on*=`) are a known
 *     XSS / CSP-violation foot-gun. A stray `oncancel="..."` string
 *     would execute as inline script if a `cancel` event ever
 *     bubbled to this element, and would trip CSP `script-src`
 *     reports under any reasonable policy that forbids
 *     `'unsafe-inline'`.
 *  3. Validators (W3C Nu, html-validate, axe) flag event-handler
 *     content attributes on elements that cannot fire the matching
 *     event as suspicious — and any string value attached here would
 *     surface as authored inline JS in DOM-introspection tooling.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `oncancel`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — silent on `oncancel`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — an ARIA state attribute, orthogonal
 *    to inline event handlers.
 *  - W2894 (LobbyChipStripNoCoords) and W2903
 *    (LobbyChipStripNoCite) pin absence of legacy HTML attributes
 *    (`coords`, `cite`) — neither covers the `on*` event-handler
 *    namespace.
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover `oncancel`.
 *    A regression that added `oncancel="..."` (e.g. by mistakenly
 *    templating a dialog-cancel handler onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("oncancel") === false`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of an HTML content
 * attribute — `oncancel=""` with an empty value is still authored,
 * and any string value is a regression. We additionally assert
 * `getAttribute("oncancel") === null` as belt-and-braces.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncancel attribute (W3243)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncancel attribute", () => {
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

    // The pin: NO oncancel attribute is authored on the chip strip.
    // A regression that adds `oncancel=""`, `oncancel="alert(1)"`,
    // or any other inline cancel-handler binding would fail here.
    expect(track!.hasAttribute("oncancel")).toBe(false);
    expect(track!.getAttribute("oncancel")).toBeNull();
  });
});
