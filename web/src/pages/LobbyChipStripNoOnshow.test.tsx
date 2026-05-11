import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3237 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onshow` attribute.
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
 * `onshow` is a legacy/obsolete inline event-handler attribute
 * (historically associated with the now-removed `<menu type="context">`
 * / context-menu show event in early HTML5 drafts). It has no defined
 * behavior on a `<div role="tablist">`:
 *  1. No modern user agent dispatches a "show" event to a generic div,
 *     so `onshow="..."` on the chip strip is dead code at best and a
 *     latent injection vector at worst (any inline handler string is
 *     parsed and stored as event-handler content).
 *  2. Validators (W3C Nu, html-validate) flag `onshow` on non-menu
 *     elements as an unknown/invalid attribute, polluting CI reports.
 *  3. Inline event-handler attributes on a tablist also violate the
 *     project's strict CSP posture (no inline handlers) — pinning
 *     absence here prevents a regression that would also break CSP.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — silent on inner attributes.
 *  - W1330 / W1331 (LobbyChipStripAria*) pin `role` and `aria-label`
 *    on the inner track — silent on inline event handlers.
 *  - W2903 (LobbyChipStripNoCite) pins absence of the `cite`
 *    attribute — a different legacy HTML attribute.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onshow`. A regression that added
 *    `onshow="alert(1)"` (e.g. by copy-pasting a legacy menu handler
 *    onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onshow") === false`.
 * `hasAttribute` (rather than just `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of an inline
 * event-handler attribute — `onshow=""` with an empty value is still
 * authored, and any string value is a regression. We also pin
 * `getAttribute("onshow") === null` as a belt-and-braces check.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onshow attribute (W3237)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onshow attribute", () => {
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

    // The pin: NO onshow attribute is authored on the chip strip.
    // A regression that adds `onshow=""`, `onshow="alert(1)"`, or any
    // other inline event-handler binding would fail here.
    expect(track!.hasAttribute("onshow")).toBe(false);
    expect(track!.getAttribute("onshow")).toBeNull();
  });
});
