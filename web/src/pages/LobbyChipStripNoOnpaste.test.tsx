import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3157 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpaste` attribute.
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
 * `onpaste` is an inline DOM event-handler attribute whose only
 * meaningful use is on text-editable hosts (inputs, textareas, or
 * `contenteditable` elements) where the user agent fires a `paste`
 * event when the user pastes data via the clipboard. On a non-editable
 * `<div role="tablist">` it is meaningless: no paste event will ever
 * dispatch on a presentational flex/scroll container of `role="tab"`
 * buttons. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not editable, not focusable as a paste target,
 *     and has no clipboard interaction surface, so there is nothing to
 *     handle on paste.
 *  2. Inline `on*` handlers are a Content-Security-Policy footgun:
 *     a strict `script-src` policy without `'unsafe-inline'` will
 *     refuse to execute inline event-handler attributes, so authoring
 *     `onpaste="..."` would silently break under CSP and pollute the
 *     console with violation reports.
 *  3. React idiomatically wires paste handling via the synthetic
 *     `onPaste` prop (camelCase), which compiles to a delegated
 *     listener — never to an HTML `onpaste=""` attribute on the DOM
 *     node. A literal lowercase `onpaste` attribute in the rendered
 *     output is therefore always a hand-authored string-template
 *     mistake, never an idiomatic React handler.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onpaste`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onpaste`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `onpaste`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    legacy HTML attribute (image-map hotspot), not an inline event
 *    handler.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    HTML quote-source URL attribute, not an inline event handler.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy/event-handler attribute's absence — none of them
 *    currently cover `onpaste`. A regression that added
 *    `onpaste="..."` (e.g. by mistakenly templating an inline
 *    clipboard handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onpaste") === false` AND
 * `track.getAttribute("onpaste") === null`. Both primitives are
 * asserted because the inline-event-handler attribute family has
 * historically been the target of both empty-string (`onpaste=""`)
 * and string-bound (`onpaste="doSomething()"`) regressions, and the
 * two assertions together pin the absence of either authoring shape.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpaste attribute (W3157)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpaste attribute", () => {
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

    // The pin: NO onpaste attribute is authored on the chip strip.
    // A regression that adds `onpaste=""`, `onpaste="handler()"`,
    // or any other inline clipboard-handler binding would fail here.
    expect(track!.hasAttribute("onpaste")).toBe(false);
    expect(track!.getAttribute("onpaste")).toBeNull();
  });
});
