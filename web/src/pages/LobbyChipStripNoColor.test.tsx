import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3112 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `color` attribute.
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
 * `color` is a legacy/obsolete HTML presentational attribute whose
 * only historical hosts were `<font>`, `<basefont>`, and `<hr>` — and
 * even there it has been removed/deprecated in HTML5 in favor of CSS
 * `color` / `border-color`. On a `<div role="tablist">` it is
 * meaningless and non-conforming because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a text-presentation element nor a
 *     horizontal rule, so the HTML `color` attribute has no defined
 *     semantics here.
 *  2. Validators (W3C Nu, html-validate, axe) flag `color` on
 *     non-font/non-hr elements as an unknown/invalid attribute,
 *     polluting CI accessibility and conformance reports.
 *  3. All visual color treatment for the chip rail must come from
 *     CSS (theme tokens, dark-mode variables, focus rings, etc.).
 *     A stray `color="#fff"` would hardcode a presentational value
 *     into the DOM, defeat theming, and confuse tooling that
 *     introspects authored attributes vs. computed style.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - The NoBgcolor / NoBordercolor / NoBordercolordark /
 *    NoBordercolorlight pins each cover a DIFFERENT legacy color
 *    attribute (background color, border palette variants). None of
 *    them assert absence of the bare `color` attribute itself.
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `color`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `color`.
 *  - A regression that added `color="#000000"` (e.g. by mistakenly
 *    templating a `<font>`-style attribute onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("color") === false` and
 * `track.getAttribute("color") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a legacy HTML attribute — `color` with an empty value is still
 * authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no color attribute (W3112)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a color attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO color attribute is authored on the chip strip.
    // A regression that adds `color=""`, `color="#fff"`, or any
    // other legacy <font>-style color binding would fail here.
    expect(track!.hasAttribute("color")).toBe(false);
    expect(track!.getAttribute("color")).toBeNull();
  });
});
