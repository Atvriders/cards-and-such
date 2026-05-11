import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3109 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onfocus` attribute as a serialized HTML attribute.
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
 * `onfocus` is a legacy inline event-handler HTML attribute. In modern
 * React applications, focus handling is wired via the `onFocus` JSX
 * prop, which React attaches as a synthetic event listener — it does
 * NOT serialize down to the DOM as an `onfocus="..."` attribute. The
 * pin here is specifically about the absence of the *serialized HTML
 * attribute* on the rendered DOM node, not about React's `onFocus`
 * prop binding. Authoring `onfocus="..."` directly on the chip strip
 * would be wrong because:
 *  1. Inline `onfocus="..."` is a string-eval handler — it bypasses
 *     React's synthetic event system, runs outside the React tree,
 *     and is a content-security-policy (CSP) hazard (requires
 *     `unsafe-inline` in `script-src`).
 *  2. It cannot be cleaned up by React's reconciler on unmount,
 *     leaking handlers across navigations.
 *  3. Validators and CSP auditors flag inline event-handler
 *     attributes as security/maintenance risks, polluting CI reports.
 *  4. A stray `onfocus="alert(1)"` or `onfocus="trackFocus()"` would
 *     imply ad-hoc focus instrumentation outside the component
 *     contract, confusing tooling that introspects the chip strip's
 *     interaction surface.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onfocus`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onfocus`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `onfocus`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `onfocus` (inline focus handler).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onfocus`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    the `onfocus` serialized HTML attribute. A regression that added
 *    `onfocus="..."` (e.g. by mistakenly templating an inline event
 *    handler onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onfocus") === false` AND
 * `track.getAttribute("onfocus") === null`. We assert both the
 * `hasAttribute` primitive (canonical absence check) and the
 * `getAttribute` null result (defense-in-depth against environments
 * that might disagree on empty-string vs null semantics).
 *
 * NOTE: This pin is about the serialized DOM attribute `onfocus`, not
 * React's `onFocus` synthetic-event prop. React's `onFocus` prop does
 * not produce an `onfocus` HTML attribute in the rendered DOM, so
 * adding `onFocus={...}` to the chip strip would NOT fail this pin —
 * only a literal inline `onfocus="..."` attribute would.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onfocus attribute (W3109)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onfocus attribute", () => {
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

    // The pin: NO onfocus attribute is authored on the chip strip as
    // a serialized HTML attribute. A regression that adds
    // `onfocus=""`, `onfocus="trackFocus()"`, or any other inline
    // focus-handler string would fail here.
    expect(track!.hasAttribute("onfocus")).toBe(false);
    expect(track!.getAttribute("onfocus")).toBeNull();
  });
});
