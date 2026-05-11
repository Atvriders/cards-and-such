import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3079 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `noembed` attribute.
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
 * `noembed` is not a valid HTML attribute on any element — it shares a
 * name with the obsolete `<noembed>` element (the fallback content
 * container historically paired with `<embed>` before HTML5
 * deprecated it). As an attribute on a `<div role="tablist">` it is
 * meaningless: no user agent, no screen reader, and no spec consumer
 * interprets `noembed` on a flex/scroll tablist container. Authoring
 * it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no relationship to plugin embedding, so there
 *     is no embedded-content fallback semantics to suppress.
 *  2. Validators (W3C Nu, html-validate, axe) flag `noembed` on a
 *     `<div>` as an unknown attribute, polluting CI accessibility
 *     reports.
 *  3. A stray `noembed=""` could confuse legacy HTML processors that
 *     still recognize the obsolete `<noembed>` element family,
 *     incorrectly classifying the filter rail as embed-fallback
 *     content.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `noembed`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `noembed`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `noembed`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `noembed` (obsolete embed-fallback marker).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quotation source URL) and
 *    silent on `noembed`.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `noembed`. A regression that added
 *    `noembed=""` (e.g. by mistakenly templating an obsolete
 *    embed-fallback marker onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("noembed") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `noembed` with an empty value is still authored, and
 * any string value is a regression. We also pin
 * `getAttribute("noembed") === null` to belt-and-braces the absence.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no noembed attribute (W3079)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a noembed attribute", () => {
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

    // The pin: NO noembed attribute is authored on the chip strip.
    // A regression that adds `noembed=""`, `noembed="true"`, or any
    // other value would fail here.
    expect(track!.hasAttribute("noembed")).toBe(false);
    expect(track!.getAttribute("noembed")).toBeNull();
  });
});
