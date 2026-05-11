import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3240 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onclose` attribute.
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
 * `onclose` is a legacy/specialized HTML event-handler content
 * attribute whose only meaningful hosts are elements that emit a
 * `close` event — `<dialog>` (HTMLDialogElement) and a small set of
 * Web Components / objects with a `.close()` lifecycle. On a
 * `<div role="tablist">` it is meaningless: a plain `<div>` has no
 * `close` event in any user agent, so the handler would never fire.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a dialog, not closeable, and emits no
 *     `close` event for an `onclose` handler to receive.
 *  2. Validators (W3C Nu, html-validate, axe) flag `onclose` on
 *     non-dialog elements as an unknown/invalid event-handler
 *     attribute, polluting CI accessibility reports.
 *  3. A stray `onclose="..."` would imply the filter rail has a
 *     dismiss/close lifecycle, confusing tooling that introspects
 *     DOM for dialog-like widgets (e.g. modal scanners, automated
 *     accessibility crawlers that look for close handlers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onclose`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onclose`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `onclose`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `onclose` (dialog close handler).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onclose`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onclose`. A regression that added
 *    `onclose="..."` (e.g. by mistakenly templating a dialog-style
 *    event handler onto the tablist) would slip past every existing
 *    pin.
 *
 * The pin: `track.hasAttribute("onclose") === false` and
 * `track.getAttribute("onclose") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * event-handler attribute — `onclose` with an empty value is still
 * authored, and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onclose attribute (W3240)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onclose attribute", () => {
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

    // The pin: NO onclose attribute is authored on the chip strip.
    // A regression that adds `onclose=""`, `onclose="handler()"`, or
    // any other dialog-close event-handler binding would fail here.
    expect(track!.hasAttribute("onclose")).toBe(false);
    expect(track!.getAttribute("onclose")).toBe(null);
  });
});
