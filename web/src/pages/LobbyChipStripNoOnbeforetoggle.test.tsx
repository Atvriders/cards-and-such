import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3231 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforetoggle` attribute.
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
 * `onbeforetoggle` is a HTML event handler content attribute that fires
 * a `ToggleEvent` (cancellable) just before a `<dialog>` or popover
 * element transitions between open/closed states. Its only valid hosts
 * are elements that participate in the popover/dialog toggle lifecycle
 * — i.e. elements with a `popover` attribute, or `<dialog>` elements
 * managed via `showModal()` / `close()`. On a `<div role="tablist">` it
 * is meaningless: the chip filter strip is neither a popover nor a
 * dialog and never dispatches a `ToggleEvent`. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no open/closed state and never fires
 *     `ToggleEvent`, so the handler would never execute.
 *  2. Inline event handler content attributes are a CSP / XSS concern
 *     — projects that ship a strict `script-src` policy (no
 *     `'unsafe-inline'`) reject any `on*=""` attribute outright.
 *  3. A stray `onbeforetoggle="..."` on a non-popover element would
 *     confuse devtools and accessibility audits that introspect the
 *     popover/dialog toggle lifecycle, suggesting the chip strip
 *     participates in a toggle dance it does not.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its event handler attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onbeforetoggle`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onbeforetoggle`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `onbeforetoggle`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy image-map hotspot attribute, silent on `onbeforetoggle`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    legacy quote-source URL attribute, silent on `onbeforetoggle`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy/event-handler attribute's absence — none
 *    of them currently cover `onbeforetoggle`. A regression that
 *    added `onbeforetoggle="..."` (e.g. by mistakenly templating a
 *    popover-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onbeforetoggle") === false` AND
 * `track.getAttribute("onbeforetoggle") === null`. Both primitives
 * agree on absence; using both wedges any regression that authors
 * the attribute with any value (empty string included).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforetoggle attribute (W3231)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforetoggle attribute", () => {
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

    // The pin: NO onbeforetoggle attribute is authored on the chip
    // strip. A regression that adds `onbeforetoggle=""`,
    // `onbeforetoggle="event.preventDefault()"`, or any other inline
    // handler binding would fail here.
    expect(track!.hasAttribute("onbeforetoggle")).toBe(false);
    expect(track!.getAttribute("onbeforetoggle")).toBeNull();
  });
});
