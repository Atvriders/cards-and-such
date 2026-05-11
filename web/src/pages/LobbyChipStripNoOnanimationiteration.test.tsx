import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3258 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onanimationiteration` attribute.
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
 * `onanimationiteration` is a legacy inline event-handler attribute
 * that fires whenever a running CSS animation completes one iteration
 * (i.e. on each loop boundary of an `animation-iteration-count > 1`
 * or `infinite` animation). On a `<div role="tablist">` filter rail
 * it is meaningless and actively undesirable because:
 *  1. The chip strip is a static flex/scroll container of
 *     `role="tab"` buttons — it runs no looping CSS animation, so
 *     there is no iteration event to listen for. Authoring
 *     `onanimationiteration="..."` would bind a handler that can
 *     never fire on this element.
 *  2. Inline event handler attributes (`on*="..."`) execute string
 *     content as JavaScript via the HTML parser's event-handler IDL.
 *     A regression that templated user-influenced content into
 *     `onanimationiteration` would be a direct XSS sink, bypassing
 *     React's normal JSX text-escaping (which only escapes element
 *     children, not attribute values that are themselves JS source).
 *  3. CSP `script-src` directives without `'unsafe-inline'` block
 *     inline event handlers — a stray `onanimationiteration` would
 *     either fail silently under strict CSP or force a relaxation of
 *     the policy, weakening the app's overall script-injection
 *     posture.
 *  4. Validators (W3C Nu, html-validate, axe) and linters
 *     (eslint-plugin-react/no-unknown-property, jsx-a11y) flag inline
 *     event-handler attributes on generic role-bearing containers as
 *     anti-patterns, polluting CI reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `onanimationiteration`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onanimationiteration`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to inline event handlers.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords`, W2903
 *    (LobbyChipStripNoCite) pins absence of `cite` — both legacy
 *    HTML content attributes, not inline event handlers.
 *  - The broad family of LobbyChipStripNo*On* pins (NoOnclick,
 *    NoOnload, NoOnerror, NoOnanimationstart, NoOnanimationend,
 *    NoOntransitionstart, NoOntransitionend, NoOntransitionrun,
 *    NoOntransitioncancel, etc.) each pin one specific inline
 *    event-handler attribute's absence — none of them currently
 *    cover `onanimationiteration` (the per-iteration sibling of
 *    `onanimationstart` / `onanimationend`). A regression that
 *    added `onanimationiteration="..."` (e.g. by mistakenly
 *    templating a looping-animation hook onto the tablist) would
 *    slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onanimationiteration") === false`
 * AND `track.getAttribute("onanimationiteration") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * an inline event-handler attribute — `onanimationiteration=""` with
 * an empty string is still an authored attribute and a regression.
 * The companion `getAttribute(...) === null` check guards against
 * any non-null string value (any value would mean the handler was
 * authored).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onanimationiteration attribute (W3258)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onanimationiteration attribute", () => {
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

    // The pin: NO onanimationiteration attribute is authored on the
    // chip strip. A regression that adds
    // `onanimationiteration=""`, `onanimationiteration="foo()"`, or
    // any other inline iteration-event handler string would fail
    // here.
    expect(track!.hasAttribute("onanimationiteration")).toBe(false);
    expect(track!.getAttribute("onanimationiteration")).toBeNull();
  });
});
