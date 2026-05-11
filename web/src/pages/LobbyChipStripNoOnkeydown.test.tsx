import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3123 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onkeydown` inline event handler attribute.
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
 * `onkeydown` is a legacy inline event handler attribute. Authoring
 * it as a DOM attribute on the chip strip would be wrong because:
 *  1. Inline event handler attributes execute their string value as
 *     JavaScript in the global scope, bypassing React's synthetic
 *     event system and any CSP `script-src` restrictions that disallow
 *     `unsafe-inline`. React idiomatically attaches handlers via
 *     props (e.g. `onKeyDown={...}`) which never surface as the
 *     lowercase `onkeydown` HTML attribute.
 *  2. The chip strip's keyboard interactions (arrow-key navigation
 *     between `role="tab"` buttons) are wired up via React refs and
 *     `addEventListener`, not inline string handlers — a stray
 *     `onkeydown="..."` attribute would either be dead code or, worse,
 *     a CSP-violating eval surface.
 *  3. Validators (W3C Nu, html-validate, axe) and CSP report-only
 *     headers flag inline event handlers as policy violations,
 *     polluting CI accessibility / security reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div — it does not introspect the inner tablist track at all.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text — silent on inline event handler attributes.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onkeydown`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    the lowercase `onkeydown` inline event handler attribute. A
 *    regression that added `onkeydown="..."` (e.g. by mistakenly
 *    spreading an HTML-attribute-shaped prop bag onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onkeydown") === false` AND
 * `track.getAttribute("onkeydown") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an HTML attribute —
 * `onkeydown` with an empty value is still authored, and any string
 * value is a regression. The companion `getAttribute(...) === null`
 * assertion is belt-and-suspenders coverage against a regression
 * that authors the attribute but somehow returns a non-null value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onkeydown attribute (W3123)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onkeydown attribute", () => {
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

    // The pin: NO onkeydown inline event handler attribute is
    // authored on the chip strip. A regression that adds
    // `onkeydown=""`, `onkeydown="handleKey(event)"`, or any other
    // string-value inline handler binding would fail here.
    expect(track!.hasAttribute("onkeydown")).toBe(false);
    expect(track!.getAttribute("onkeydown")).toBeNull();
  });
});
