import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2949 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `cols` attribute.
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
 * `cols` is a legacy HTML attribute whose only valid hosts are
 * `<textarea>` (visible character-width of the editable area) and
 * `<frameset>` (now-obsolete frame layout column track sizing). On a
 * `<div role="tablist">` it is meaningless: no user agent, no screen
 * reader, and no spec consumer interprets `cols` on a non-textarea /
 * non-frameset element. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an editable text area nor a frameset
 *     layout container, so there are no character columns or frame
 *     tracks to size.
 *  2. Validators (W3C Nu, html-validate, axe) flag `cols` on
 *     non-textarea/non-frameset elements as an unknown/invalid
 *     attribute, polluting CI accessibility reports.
 *  3. A stray `cols="40"` would imply the filter rail is an editable
 *     text region or frameset, confusing tooling that introspects DOM
 *     structure (e.g. form-field harvesters, layout analyzers,
 *     legacy-frameset crawlers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `cols`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `cols`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `cols`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `cols` (textarea/frameset column sizing).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — quote
 *    source URL, orthogonal to `cols`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `cols`. A regression that added `cols="40"` (e.g. by mistakenly
 *    templating a textarea-style attribute onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("cols") === false` AND
 * `track.getAttribute("cols") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `cols` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no cols attribute (W2949)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a cols attribute", () => {
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

    // The pin: NO cols attribute is authored on the chip strip.
    // A regression that adds `cols=""`, `cols="40"`, or any other
    // textarea/frameset column binding would fail here.
    expect(track!.hasAttribute("cols")).toBe(false);
    expect(track!.getAttribute("cols")).toBeNull();
  });
});
