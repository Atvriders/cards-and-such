import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3110 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onblur` attribute.
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
 * `onblur` is a legacy inline event-handler HTML attribute whose
 * value is a string of JavaScript executed when the element loses
 * focus. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a `<div role="tablist">` — a non-focusable
 *     scroll container of `role="tab"` buttons. It does not itself
 *     receive focus, so an `onblur` attribute is meaningless and
 *     would never fire.
 *  2. Inline `on*` attributes execute string-evaluated JavaScript,
 *     which is a Content-Security-Policy violation under any
 *     `script-src` directive that omits `'unsafe-inline'`. The app
 *     uses React synthetic events (`onBlur` JSX prop) — never the
 *     stringified DOM attribute. A regression that templated
 *     `onblur="..."` onto the tablist would both fail CSP and
 *     bypass React's event-delegation model.
 *  3. Validators (W3C Nu, html-validate, axe, eslint-plugin-react)
 *     flag inline event-handler attributes as anti-patterns; an
 *     authored `onblur=""` would pollute CI reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its event-handler attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onblur`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onblur`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of the legacy `cite`
 *    quote-source attribute — silent on `onblur`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `onblur` (inline blur event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onblur`. A regression that added
 *    `onblur="..."` (e.g. by mistakenly templating a stringified
 *    handler onto the tablist instead of using the React `onBlur`
 *    JSX prop) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onblur") === false` AND
 * `track.getAttribute("onblur") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an inline
 * event-handler attribute — `onblur=""` is still authored even when
 * the value is empty, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onblur attribute (W3110)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onblur attribute", () => {
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

    // The pin: NO onblur attribute is authored on the chip strip.
    // A regression that adds `onblur=""`, `onblur="doStuff()"`, or
    // any other stringified inline blur handler would fail here.
    expect(track!.hasAttribute("onblur")).toBe(false);
    expect(track!.getAttribute("onblur")).toBeNull();
  });
});
