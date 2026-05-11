import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3315 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsecuritypolicyviolation` attribute.
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
 * `onsecuritypolicyviolation` is an inline global event-handler content
 * attribute that fires when a Content Security Policy violation is
 * reported on the element (mirroring the `securitypolicyviolation`
 * event). It belongs — when used at all — on the `<body>` element or
 * be bound programmatically via `addEventListener`. Authoring it as an
 * inline HTML attribute on a `<div role="tablist">` would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it neither loads sub-resources nor evaluates inline
 *     code, so there is nothing on this element that could produce a
 *     CSP violation report.
 *  2. Inline event-handler attributes are themselves a frequent CSP
 *     `script-src 'unsafe-inline'` smell; authoring
 *     `onsecuritypolicyviolation="..."` on a tab strip would be
 *     gratuitously broadening the inline-handler surface area of the
 *     page.
 *  3. CSP violation handling is a global, page-level concern routed
 *     through the document's `securitypolicyviolation` event — pinning
 *     it onto a single visual sub-component fragments the reporting
 *     pipeline and risks shadowing the canonical handler.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onsecuritypolicyviolation`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on inline handlers.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `onsecuritypolicyviolation`. A regression that added
 *    `onsecuritypolicyviolation="..."` (e.g. by mistakenly templating
 *    a body-level CSP handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onsecuritypolicyviolation") === false`
 * AND `track.getAttribute("onsecuritypolicyviolation") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onsecuritypolicyviolation attribute (W3315)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsecuritypolicyviolation attribute", () => {
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

    // The pin: NO onsecuritypolicyviolation attribute is authored on
    // the chip strip. A regression that adds
    // `onsecuritypolicyviolation=""` or any handler binding would
    // fail here.
    expect(track!.hasAttribute("onsecuritypolicyviolation")).toBe(false);
    expect(track!.getAttribute("onsecuritypolicyviolation")).toBeNull();
  });
});
