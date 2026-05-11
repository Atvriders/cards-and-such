import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3306 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onafterprint` attribute.
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
 * `onafterprint` is a legacy global event-handler content attribute
 * whose only meaningful host is the `<body>` element (where it
 * proxies the `afterprint` event to `window`). On a
 * `<div role="tablist">` it is meaningless: the `afterprint` event
 * fires on `window`, not on arbitrary DOM elements, so authoring
 * `onafterprint` as an inline handler on a div has no effect.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no print-lifecycle responsibility, and the
 *     filter rail has nothing to do with the user's print dialog.
 *  2. Inline event-handler attributes are the textbook CSP
 *     `unsafe-inline` violation — adding `onafterprint="..."` would
 *     break any deployment that ships a strict CSP without
 *     `unsafe-inline` for scripts.
 *  3. A stray `onafterprint="alert(1)"` (or any string body) would
 *     be a security smell flagged by linters (eslint-plugin-react's
 *     no-unknown-property, html-validate's no-unknown-elements, and
 *     CSP report endpoints).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onafterprint`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onafterprint`.
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
 *    attribute's absence — none of them currently cover
 *    `onafterprint`. A regression that added
 *    `onafterprint="..."` (e.g. by mistakenly templating a
 *    body-level print-lifecycle handler onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onafterprint") === false` AND
 * `track.getAttribute("onafterprint") === null`. Both primitives
 * are checked because `hasAttribute` is the canonical absence
 * primitive and `getAttribute` returning `null` is the canonical
 * "attribute not present" sentinel — checking both narrows the
 * regression surface to zero.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onafterprint attribute (W3306)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onafterprint attribute", () => {
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

    // The pin: NO onafterprint attribute is authored on the chip
    // strip. A regression that adds `onafterprint=""`,
    // `onafterprint="alert(1)"`, or any other inline print-lifecycle
    // handler binding would fail here.
    expect(track!.hasAttribute("onafterprint")).toBe(false);
    expect(track!.getAttribute("onafterprint")).toBeNull();
  });
});
