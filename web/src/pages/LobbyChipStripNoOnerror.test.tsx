import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3117 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onerror` attribute.
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
 * `onerror` is a legacy HTML event-handler content attribute whose
 * primary valid hosts are resource-loading elements like `<img>`,
 * `<script>`, `<link>`, `<audio>`, `<video>`, `<iframe>`, `<source>`,
 * `<object>`, `<body>` (where it bubbles window-level resource errors),
 * etc. On a `<div role="tablist">` it is meaningless: a plain `<div>`
 * does not load an external resource and therefore cannot fire an
 * `error` event for resource loading. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no `src`, `href`, or otherwise external
 *     resource binding that could fail to load. There is no error
 *     event a `<div>` would emit that `onerror` could intercept.
 *  2. Inline event-handler content attributes (`onerror="..."`,
 *     `onclick="..."`, etc.) are flagged by every modern CSP audit
 *     (`unsafe-inline` is forbidden under strict CSP) and by lint
 *     rules like `react/no-unknown-property` and `jsx-a11y` — they
 *     pollute CI and security reports.
 *  3. A stray `onerror="alert(1)"` is the canonical XSS sink in
 *     classic injection payloads. Pinning its ABSENCE on a stable
 *     authored element forms a tripwire that a templating regression
 *     (or supply-chain injection) cannot quietly add an inline JS
 *     event handler here without flipping a test red.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onerror`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onerror`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onerror`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords`,
 *    W2903 (LobbyChipStripNoCite) pins absence of `cite` — different
 *    legacy HTML attributes and silent on `onerror`.
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
 *    NoShape) each pin one specific global/legacy attribute's absence
 *    — none of them currently cover `onerror`. A regression that
 *    added `onerror="..."` (e.g. via a templated XSS sink or a
 *    misapplied resource-error handler) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onerror") === false`
 *   and `track.getAttribute("onerror") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an inline event-handler content attribute — `onerror=""` with an
 * empty value is still authored, and any string value is a
 * regression. The `getAttribute(...) === null` companion check pins
 * the DOM-string read path: any future regression that authors a
 * non-empty handler string here would flip the second assertion.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onerror attribute (W3117)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onerror attribute", () => {
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

    // The pin: NO onerror attribute is authored on the chip strip.
    // A regression that adds `onerror=""`, `onerror="alert(1)"`, or
    // any other inline error-handler binding would fail here.
    expect(track!.hasAttribute("onerror")).toBe(false);
    expect(track!.getAttribute("onerror")).toBeNull();
  });
});
