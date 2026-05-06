import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2938 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `pattern` attribute.
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
 * `pattern` is an HTML form-validation attribute whose only valid host
 * is `<input>` (specifically `<input type="text|search|url|tel|email|password">`),
 * where it carries a JavaScript-style regular expression that the
 * input's value must match for the form to be considered valid. On a
 * `<div role="tablist">` it is meaningless: no user agent, no form
 * validator, and no constraint-validation API consumer interprets
 * `pattern` on a non-`<input>` element. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no `value` to validate, so a regex pattern is
 *     conceptually inapplicable.
 *  2. Validators (W3C Nu, html-validate, axe) flag `pattern` on
 *     non-`<input>` elements as an unknown/invalid attribute,
 *     polluting CI accessibility reports.
 *  3. A stray `pattern="[A-Za-z]+"` would imply the filter rail
 *     participates in form constraint validation, confusing tooling
 *     that introspects DOM form semantics (e.g. form-builders,
 *     accessibility linters, automated form fillers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy/form HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `pattern`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `pattern`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `pattern`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `pattern` (input regex validator).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `pattern`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `pattern`. A regression that added `pattern="[A-Za-z]+"` (e.g. by
 *    mistakenly templating an input-style validation attribute onto
 *    the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("pattern") === false` AND
 * `track.getAttribute("pattern") === null`. `hasAttribute` (rather
 * than only `getAttribute(...) === null`) is the canonical primitive
 * for asserting absence of an HTML attribute — `pattern=""` (empty
 * value) is still authored and would return `""` from `getAttribute`,
 * not `null`. We assert both for belt-and-suspenders coverage.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no pattern attribute (W2938)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a pattern attribute", () => {
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

    // The pin: NO pattern attribute is authored on the chip strip.
    // A regression that adds `pattern=""`, `pattern="[A-Za-z]+"`,
    // or any other regex validation binding would fail here.
    expect(track!.hasAttribute("pattern")).toBe(false);
    expect(track!.getAttribute("pattern")).toBeNull();
  });
});
