import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3285 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onlanguagechange` attribute.
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
 * `onlanguagechange` is a global event handler attribute that fires
 * when the user's preferred languages change. The spec scopes it to
 * `WindowEventHandlers` — i.e. it is meaningful on `<body>` /
 * `<frameset>` as a window-level event-handler shorthand, NOT on an
 * arbitrary `<div>`. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no business listening to window-level
 *     language-change events at the DOM level.
 *  2. Inline event-handler content attributes are a string-eval
 *     vector (the browser parses the attribute value as JS), so any
 *     stray `onlanguagechange="…"` would be both a CSP-incompatible
 *     anti-pattern and a security smell.
 *  3. Validators (W3C Nu, html-validate) flag `onlanguagechange` on
 *     non-`<body>`/non-`<frameset>` elements as out-of-scope for the
 *     WindowEventHandlers mixin, polluting CI reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its event-handler attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onlanguagechange`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onlanguagechange`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `onlanguagechange` (language-change handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy/event-handler attribute's absence — none
 *    of them currently cover `onlanguagechange`. A regression that
 *    added `onlanguagechange="…"` (e.g. by mistakenly templating a
 *    body-level WindowEventHandlers attribute onto the tablist)
 *    would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onlanguagechange") === false` AND
 * `track.getAttribute("onlanguagechange") === null`. `hasAttribute`
 * is the canonical primitive for asserting absence of a content
 * attribute — `onlanguagechange=""` with an empty value is still
 * authored, and any string value is a regression. The
 * `getAttribute(...) === null` assertion is a belt-and-braces
 * cross-check that the attribute is truly absent from the DOM.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onlanguagechange attribute (W3285)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onlanguagechange attribute", () => {
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

    // The pin: NO onlanguagechange attribute is authored on the chip
    // strip. A regression that adds `onlanguagechange=""`,
    // `onlanguagechange="handler()"`, or any other event-handler
    // string binding would fail here.
    expect(track!.hasAttribute("onlanguagechange")).toBe(false);
    expect(track!.getAttribute("onlanguagechange")).toBeNull();
  });
});
