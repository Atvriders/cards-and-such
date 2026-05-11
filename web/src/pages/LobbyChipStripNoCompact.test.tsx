import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3023 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `compact` attribute.
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
 * `compact` is a legacy HTML boolean attribute whose only historic
 * hosts were list-like elements: `<dir>`, `<dl>`, `<menu>`, `<ol>`,
 * and `<ul>` — where it requested a denser inter-item spacing. The
 * attribute has been obsolete since HTML5 (visual density is handled
 * entirely by CSS now) and was never valid on a `<div>` at all. On
 * a `<div role="tablist">` it is meaningless because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — not a list element, so the historic spacing
 *     semantic never applied.
 *  2. Validators (W3C Nu, html-validate, axe) flag `compact` on
 *     non-list elements (or anywhere in HTML5) as an obsolete /
 *     unknown attribute, polluting CI accessibility reports.
 *  3. A stray `compact` (or `compact="compact"`) would be silently
 *     dropped by some sanitizers and retained by others, creating
 *     inconsistent DOM snapshots across environments.
 *  4. Visual density of the chip strip is already controlled by the
 *     `.lobby-chips` CSS rules — re-expressing it via a legacy HTML
 *     attribute would split the styling source-of-truth.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `compact`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `compact`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `compact`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `compact` (list density).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL).
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
 *    NoCite, NoSummary, NoNohref, NoNowrap) each pin one specific
 *    global/legacy attribute's absence — none of them currently
 *    cover `compact`. A regression that added `compact` (e.g. by
 *    mistakenly templating a list-style attribute onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("compact") === false` AND
 * `track.getAttribute("compact") === null`. Both primitives are
 * asserted because:
 *  - `hasAttribute` is the canonical absence check; `compact` as a
 *    boolean attribute is "present" even when its value is the
 *    empty string, so `getAttribute(...) === ""` is NOT sufficient.
 *  - `getAttribute(...) === null` is the parallel value-side check
 *    that catches a regression which somehow tricks `hasAttribute`
 *    (e.g. via direct `.attributes` manipulation in a polyfill).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no compact attribute (W3023)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a compact attribute", () => {
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

    // The pin: NO compact attribute is authored on the chip strip.
    // A regression that adds `compact`, `compact=""`, or
    // `compact="compact"` would fail at least one of these.
    expect(track!.hasAttribute("compact")).toBe(false);
    expect(track!.getAttribute("compact")).toBeNull();
  });
});
