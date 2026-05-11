import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3180 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onauxclick` attribute.
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
 * `onauxclick` is the inline event-handler content attribute for the
 * non-primary (typically middle/right) pointer-button click. As an
 * inline `on*` attribute it is a legacy HTML mechanism for binding a
 * string of JavaScript to a DOM event — strictly inferior to the
 * React-idiomatic `onAuxClick` prop, which attaches a delegated
 * listener through React's synthetic event system. Authoring an
 * inline `onauxclick="..."` on the chip strip would be wrong because:
 *  1. The chip strip is a `role="tablist"` of buttons; non-primary
 *     pointer button activation is not part of the WAI-ARIA tablist
 *     keyboard/pointer contract. Wiring an aux-click handler at the
 *     tablist level would expose undocumented middle/right-click
 *     behavior that AT users cannot discover.
 *  2. Inline `on*` attributes bypass React's event delegation and
 *     synthetic event pooling, defeating CSP `script-src` policies
 *     that forbid inline-event handlers, and creating a string-eval'd
 *     handler scope that is hostile to bundlers and SSR hydration.
 *  3. Static-analysis tools (eslint-plugin-react/no-unknown-property,
 *     eslint-plugin-security/detect-non-literal-fs-filename's siblings,
 *     html-validate `no-inline-events`) flag inline `onauxclick=...`
 *     attributes as policy violations and would noisily fail CI.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onauxclick`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onauxclick`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onauxclick` (auxiliary-button click handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onauxclick`. A regression that added
 *    `onauxclick="..."` (e.g. by mistakenly templating an inline
 *    middle-click handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onauxclick") === false` AND
 * `track.getAttribute("onauxclick") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an authored content attribute — an empty-string value is still
 * authored. `getAttribute(...) === null` provides the belt-and-braces
 * complement: any string value (including the empty string) would
 * flunk both halves of the pin.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onauxclick attribute (W3180)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onauxclick attribute", () => {
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

    // The pin: NO onauxclick attribute is authored on the chip strip.
    // A regression that adds `onauxclick=""`, `onauxclick="alert(1)"`,
    // or any other inline aux-click handler string would fail here.
    expect(track!.hasAttribute("onauxclick")).toBe(false);
    expect(track!.getAttribute("onauxclick")).toBeNull();
  });
});
