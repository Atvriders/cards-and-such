import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2956 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `list` attribute.
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
 * `list` is an HTML attribute whose only valid host is `<input>`, where
 * it carries the id of a `<datalist>` element supplying autocomplete
 * suggestions for the input. On a `<div role="tablist">` it is
 * meaningless: no user agent, no screen reader, and no spec consumer
 * interprets `list` on a non-input element. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an editable text input nor a form
 *     control, so there is no datalist of suggestions to bind.
 *  2. Validators (W3C Nu, html-validate, axe) flag `list` on
 *     non-input elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `list="some-datalist-id"` would imply the filter rail
 *     is an autocompleting input field, confusing tooling that
 *     introspects DOM provenance (e.g. form-field harvesters,
 *     datalist-suggestion crawlers, autofill heuristics).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `list`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `list`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `list`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `list` (input datalist binding).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — quote
 *    source URL, orthogonal to `list`.
 *  - W2949 (LobbyChipStripNoCols) pins absence of `cols` —
 *    textarea/frameset column sizing, orthogonal to `list`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `list`. A regression that added `list="suggestions"` (e.g. by
 *    mistakenly templating an input-style autocomplete attribute onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("list") === false` AND
 * `track.getAttribute("list") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an HTML attribute —
 * `list` with an empty value is still authored, and any string value
 * is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no list attribute (W2956)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a list attribute", () => {
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

    // The pin: NO list attribute is authored on the chip strip.
    // A regression that adds `list=""`, `list="suggestions"`, or any
    // other input-datalist binding would fail here.
    expect(track!.hasAttribute("list")).toBe(false);
    expect(track!.getAttribute("list")).toBeNull();
  });
});
