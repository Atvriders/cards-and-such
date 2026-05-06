import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2945 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `maxlength` attribute.
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
 * `maxlength` is an HTML attribute whose only valid hosts are
 * `<input>` and `<textarea>` — where it caps the number of UTF-16
 * code units the user may type into the form control. On a
 * `<div role="tablist">` it is meaningless: no user agent, no screen
 * reader, and no spec consumer interprets `maxlength` on a
 * non-form-control element. Authoring it on the chip strip would be
 * wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an `<input>` nor a `<textarea>`, so
 *     there is no user-typed text whose length should be capped.
 *  2. Validators (W3C Nu, html-validate, axe) flag `maxlength` on
 *     non-form-control elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `maxlength="50"` would imply the filter rail is a
 *     bounded-length text field, confusing tooling that introspects
 *     DOM provenance (e.g. form schema extractors, automated form
 *     filling utilities, accessibility audits).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `maxlength`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `maxlength`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `maxlength`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `maxlength` (form control text length cap).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `maxlength`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `maxlength`. A regression that added `maxlength="50"` (e.g. by
 *    mistakenly templating an input-style attribute onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("maxlength") === false` and
 * `track.getAttribute("maxlength") === null`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `maxlength` with an empty value is still authored, and
 * any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no maxlength attribute (W2945)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a maxlength attribute", () => {
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

    // The pin: NO maxlength attribute is authored on the chip strip.
    // A regression that adds `maxlength=""`, `maxlength="50"`, or any
    // other text-length cap binding would fail here.
    expect(track!.hasAttribute("maxlength")).toBe(false);
    expect(track!.getAttribute("maxlength")).toBeNull();
  });
});
