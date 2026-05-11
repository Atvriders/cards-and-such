import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3141 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onresize` attribute.
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
 * `onresize` is a legacy inline event-handler content attribute whose
 * valid hosts in the HTML spec are `<body>`, `<frameset>`, and (per
 * GlobalEventHandlers) Window-level objects — it fires when the
 * viewport is resized. On a `<div role="tablist">` it is meaningless:
 * regular elements do not dispatch a `resize` event, so an inline
 * `onresize="..."` handler on the chip strip would never run.
 * Authoring it would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a window/body/frameset, so no `resize`
 *     event will ever bubble or target it.
 *  2. Validators (W3C Nu, html-validate, axe) and strict CSP audits
 *     flag inline event-handler attributes (`on*=""`) as unsafe and
 *     as an inline-script CSP violation, polluting CI reports.
 *  3. A stray `onresize="window.location='https://example.com'"` is a
 *     classic XSS injection vector — any pin on the absence of inline
 *     event-handler attributes hardens the chip strip against
 *     templating regressions that smuggle script through DOM props.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onresize`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onresize`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `onresize`.
 *  - W2894 (LobbyChipStripNoCoords), W2903 (LobbyChipStripNoCite),
 *    and the broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onresize`. A regression that added
 *    `onresize="..."` (e.g. by mistakenly templating a window-level
 *    handler onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onresize") === false` AND
 * `track.getAttribute("onresize") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an inline event-handler
 * attribute — `onresize=""` with an empty value is still authored,
 * and any string value is a regression. The `getAttribute(...) === null`
 * companion check guards against a getter that surfaces an empty
 * string for an absent attribute.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onresize attribute (W3141)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onresize attribute", () => {
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

    // The pin: NO onresize attribute is authored on the chip strip.
    // A regression that adds `onresize=""`, `onresize="someHandler()"`,
    // or any other inline event-handler binding would fail here.
    expect(track!.hasAttribute("onresize")).toBe(false);
    expect(track!.getAttribute("onresize")).toBeNull();
  });
});
