import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3139 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onreset` attribute.
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
 * `onreset` is a legacy HTML event-handler content attribute whose
 * only valid host is `<form>` — it fires when a form is reset (e.g.
 * via a `<button type="reset">` or `form.reset()`). On a
 * `<div role="tablist">` it is meaningless: the chip strip is not a
 * form, has no form-control descendants subject to reset, and no
 * user agent will ever dispatch a `reset` event at it. Authoring it
 * on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a `<form>` nor a form-associated
 *     custom element, so there is no reset lifecycle to handle.
 *  2. Inline event-handler content attributes (`onreset="..."`) are
 *     CSP-hostile: they require `unsafe-inline` script in
 *     `script-src` (or a matching nonce/hash) to run, which weakens
 *     the page's Content-Security-Policy posture.
 *  3. A stray `onreset="doSomething()"` on a non-form element is a
 *     dead handler — it will never fire, masking the author's real
 *     intent and confusing downstream tooling (linters, codemods,
 *     accessibility scanners) that try to reason about which
 *     elements participate in form lifecycles.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onreset`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onreset`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onreset` (form reset handler).
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `onreset`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onreset`. A regression that added
 *    `onreset="..."` (e.g. by mistakenly templating a form-style
 *    handler onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onreset") === false` AND
 * `track.getAttribute("onreset") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `onreset` with an empty value is still authored, and
 * any string value is a regression. The `getAttribute === null`
 * check is a belt-and-braces redundant assertion that the attribute
 * is truly absent rather than present-with-empty-value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onreset attribute (W3139)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onreset attribute", () => {
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

    // The pin: NO onreset attribute is authored on the chip strip.
    // A regression that adds `onreset=""`, `onreset="handler()"`,
    // or any other form-reset handler binding would fail here.
    expect(track!.hasAttribute("onreset")).toBe(false);
    expect(track!.getAttribute("onreset")).toBeNull();
  });
});
