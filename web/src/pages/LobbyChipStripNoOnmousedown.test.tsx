import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3128 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmousedown` attribute.
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
 * `onmousedown` is a legacy HTML inline event-handler content
 * attribute. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip uses React synthetic events (e.g. `onMouseDown`
 *    via JSX prop binding) wired through the React event delegation
 *    system on the root container — not via DOM inline handler
 *    attributes. A literal `onmousedown="..."` HTML attribute would
 *    install a parallel, string-evaluated handler that bypasses
 *    React's event system entirely.
 *  2. Inline event-handler attributes are evaluated via implicit
 *    `Function` construction with global scope, which is incompatible
 *    with a strict Content-Security-Policy (`script-src` without
 *    `'unsafe-inline'`) and is flagged by every modern CSP linter.
 *  3. A stray `onmousedown="alert(1)"` regression would constitute a
 *    code-injection vector if any portion of the attribute string is
 *    user-influenced — exactly the class of XSS that React's
 *    synthetic-event model is designed to prevent.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onmousedown`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onmousedown` (inline mouse-down event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onmousedown`. A regression that added
 *    `onmousedown="..."` (e.g. by mistakenly templating an inline
 *    handler string onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onmousedown") === false` and
 * `track.getAttribute("onmousedown") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onmousedown attribute (W3128)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmousedown attribute", () => {
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

    // The pin: NO onmousedown attribute is authored on the chip strip.
    // A regression that adds `onmousedown=""`, `onmousedown="alert(1)"`,
    // or any other inline mouse-down handler binding would fail here.
    expect(track!.hasAttribute("onmousedown")).toBe(false);
    expect(track!.getAttribute("onmousedown")).toBeNull();
  });
});
