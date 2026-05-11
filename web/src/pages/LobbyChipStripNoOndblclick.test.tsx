import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3177 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondblclick` attribute.
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
 * `ondblclick` is a legacy inline event-handler content attribute that
 * registers a JavaScript expression to run on a `dblclick` DOM event.
 * Authoring it on the chip strip would be wrong because:
 *  1. React components register event handlers via the synthetic event
 *     system (`onDoubleClick={...}`), NOT via inline HTML attribute
 *     strings — an `ondblclick="..."` literal in the rendered DOM
 *     indicates a hand-authored regression, not idiomatic React.
 *  2. Inline event-handler attributes are blocked by strict
 *     Content-Security-Policy (`script-src` without `'unsafe-inline'`)
 *     — a stray `ondblclick="alert(1)"` would either silently fail
 *     under CSP or, worse, execute under a permissive policy as an
 *     XSS sink.
 *  3. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons; double-click semantics on the container itself have no
 *     defined meaning in the WAI-ARIA tablist pattern. Authoring
 *     `ondblclick` would imply behavior that screen readers and
 *     keyboard users cannot reach.
 *  4. Validators (W3C Nu, html-validate) and security scanners (axe,
 *     CSP evaluators) flag inline event handlers as code-smell /
 *     security warnings, polluting CI reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track's inline event-handler attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `ondblclick`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy attribute (quote source URL) and silent on
 *    `ondblclick` (double-click event handler).
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCoords, NoMethod, NoAction, NoUsemap,
 *    NoShape, NoCite) each pin one specific global/legacy attribute's
 *    absence — none of them currently cover `ondblclick`. A
 *    regression that added `ondblclick="..."` (e.g. by mistakenly
 *    inlining a double-click handler onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("ondblclick") === false` AND
 * `track.getAttribute("ondblclick") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a legacy HTML attribute — `ondblclick` with an empty value is still
 * authored, and any string value is a regression. The paired
 * `getAttribute(...) === null` is the belt-and-suspenders check that
 * also rejects any non-empty handler binding.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondblclick attribute (W3177)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondblclick attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
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

    // The pin: NO ondblclick attribute is authored on the chip strip.
    // A regression that adds `ondblclick=""`, `ondblclick="alert(1)"`,
    // or any other inline double-click handler binding would fail
    // here.
    expect(track!.hasAttribute("ondblclick")).toBe(false);
    expect(track!.getAttribute("ondblclick")).toBeNull();
  });
});
