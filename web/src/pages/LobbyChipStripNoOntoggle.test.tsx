import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3234 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontoggle` attribute.
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
 * `ontoggle` is the inline event-handler attribute fired by the
 * `<details>` element when its open/closed state changes (and by
 * `<dialog>` for some user agents). It is meaningful only on elements
 * that emit a `toggle` event — primarily `<details>`. On a generic
 * `<div role="tablist">` it is meaningless:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a disclosure widget, never fires a `toggle`
 *     event, and any handler bound via `ontoggle="..."` would simply
 *     sit dead on the node.
 *  2. Inline event-handler content attributes (`on*="..."`) are a
 *     long-standing XSS vector — every authored `ontoggle` on a non-
 *     `<details>` element is either dead code or an injection sink,
 *     and CSP `script-src` policies routinely block them.
 *  3. Validators (W3C Nu, html-validate, axe) flag stray `on*`
 *     attributes on elements that cannot fire the corresponding event
 *     as suspicious, polluting CI accessibility / security reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `ontoggle`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `ontoggle`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `ontoggle`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy HTML attribute (image-map hotspot) and silent on
 *    `ontoggle` (details-toggle event handler).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    quote-source URL attribute and silent on `ontoggle`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy/event-handler attribute's absence — none
 *    of them currently cover `ontoggle`. A regression that added
 *    `ontoggle="..."` (e.g. by mistakenly templating a details-style
 *    handler onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("ontoggle") === false` AND
 * `track.getAttribute("ontoggle") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an inline event-handler content attribute — `ontoggle=""` with an
 * empty value is still authored, and any string value is a
 * regression. The `getAttribute === null` check is a redundant
 * belt-and-braces guard against attribute-presence-but-null-value
 * weirdness in non-standard DOM implementations.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ontoggle attribute (W3234)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontoggle attribute", () => {
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

    // The pin: NO ontoggle attribute is authored on the chip strip.
    // A regression that adds `ontoggle=""`, `ontoggle="alert(1)"`,
    // or any other inline details-toggle handler would fail here.
    expect(track!.hasAttribute("ontoggle")).toBe(false);
    expect(track!.getAttribute("ontoggle")).toBeNull();
  });
});
