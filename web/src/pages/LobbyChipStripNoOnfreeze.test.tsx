import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3330 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onfreeze` attribute.
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
 * `onfreeze` is a legacy WAP/mobile event-handler attribute (from the
 * obsolete Web Application 1.0 / WebApps era) that was intended to
 * fire when a document was frozen by the user agent (e.g. when a
 * background tab was suspended). It is not part of the modern HTML
 * Living Standard, no major browser implements it as an inline
 * attribute handler, and authoring it on a `<div role="tablist">`
 * is meaningless because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no document-lifecycle semantics and is not a
 *     valid host for any `onfreeze` callback.
 *  2. Validators (W3C Nu, html-validate, axe) flag `onfreeze` on
 *     non-spec elements as an unknown attribute, polluting CI
 *     accessibility reports.
 *  3. A stray `onfreeze="..."` would imply the filter rail wants to
 *     react to document freeze events, confusing tooling that
 *     introspects DOM event-handler attributes (e.g. CSP scanners,
 *     inline-handler auditors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onfreeze`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onfreeze`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onfreeze` (document-freeze event handler).
 *  - The broad family of LobbyChipStripNo* pins (NoAccesskey,
 *    NoAutofocus, NoTabindex, NoLang, NoDir, NoId, NoStyle, NoForm,
 *    NoName, NoValue, NoSlot, NoPart, NoIs, NoNonce, NoHidden,
 *    NoInert, NoSpellcheck, NoTranslate, NoContenteditable,
 *    NoAutocomplete, NoAutocapitalize, NoInputmode, NoHref, NoTarget,
 *    NoRel, NoDownload, NoAnchor, NoBlocking, NoElementtiming,
 *    NoExportparts, NoItemid, NoItemprop, NoItemref, NoItemscope,
 *    NoItemtype, NoPopover, NoPopovertarget, NoVirtualkeyboardpolicy,
 *    NoWritingsuggestions, NoCoords, NoCite, NoMethod, NoAction,
 *    NoUsemap, NoShape) each pin one specific global/legacy
 *    attribute's absence — none of them currently cover `onfreeze`.
 *    A regression that added `onfreeze="..."` (e.g. by mistakenly
 *    templating a document-lifecycle handler onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onfreeze") === false` AND
 * `track.getAttribute("onfreeze") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an authored attribute
 * (an empty-string `onfreeze=""` would still be authored), and the
 * `getAttribute(...) === null` companion guards against any tooling
 * that might serialize a missing attribute as the empty string.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onfreeze attribute (W3330)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onfreeze attribute", () => {
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

    // The pin: NO onfreeze attribute is authored on the chip strip.
    // A regression that adds `onfreeze=""`, `onfreeze="..."`, or any
    // other document-freeze event-handler binding would fail here.
    expect(track!.hasAttribute("onfreeze")).toBe(false);
    expect(track!.getAttribute("onfreeze")).toBeNull();
  });
});
