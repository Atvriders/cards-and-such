import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3115 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onchange` attribute.
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
 * `onchange` is an inline event-handler content attribute whose only
 * meaningful hosts are form controls (`<input>`, `<select>`,
 * `<textarea>`) — where the user agent fires a `change` event on
 * value commit. On a `<div role="tablist">` it is dead weight:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no `value` to commit, so no `change` event is
 *     ever dispatched to the element. The attribute would never fire.
 *  2. Inline `on*` handlers as HTML attributes are a CSP / XSS
 *     anti-pattern — strict CSP (`script-src 'self'`) blocks inline
 *     handler execution, and any future tightening of the app's CSP
 *     would silently break a chip strip that started leaning on
 *     `onchange="..."` instead of a proper React event prop.
 *  3. React's synthetic `onChange` prop attaches a listener via the
 *     synthetic event system; it never lowers to an `onchange` HTML
 *     attribute on the rendered DOM node. A literal `onchange` in the
 *     authored markup would mean someone reached past React with a
 *     raw HTML-string injection or a raw `setAttribute` — both
 *     regressions worth catching.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onchange`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onchange`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to inline event handlers.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy image-map attribute, silent on `onchange`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    quote-source attribute, silent on `onchange`.
 *  - The broad family of LobbyChipStripNo* pins each cover ONE
 *    specific global / legacy / ARIA / inline-handler attribute's
 *    absence — none of them currently cover `onchange`. A regression
 *    that added `onchange="..."` (e.g. by mistakenly templating a
 *    form-control attribute onto the tablist, or by a raw DOM
 *    `setAttribute('onchange', ...)` call) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onchange") === false` and
 * `track.getAttribute("onchange") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an inline event-handler attribute — `onchange` with an empty value
 * is still authored, and any string value is a regression. The
 * `getAttribute(...) === null` companion locks in the standard DOM
 * "missing attribute" return value alongside the `hasAttribute`
 * primary.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onchange attribute (W3115)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onchange attribute", () => {
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

    // The pin: NO onchange inline event-handler attribute is authored
    // on the chip strip. A regression that adds `onchange=""`,
    // `onchange="handler()"`, or any other inline handler string
    // would fail here.
    expect(track!.hasAttribute("onchange")).toBe(false);
    expect(track!.getAttribute("onchange")).toBeNull();
  });
});
