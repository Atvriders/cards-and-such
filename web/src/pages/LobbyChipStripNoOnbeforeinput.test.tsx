import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3204 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforeinput` attribute.
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
 * `onbeforeinput` is a legacy HTML inline event-handler attribute that
 * fires the `beforeinput` event before an editing host mutates its
 * value/text. Its only meaningful hosts are editable surfaces:
 * `<input>`, `<textarea>`, and elements with `contenteditable`. On a
 * non-editable `<div role="tablist">` it is meaningless: the chip-strip
 * track never receives `beforeinput` events because it has no editable
 * content. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither an editable host nor a form control, so
 *     no `beforeinput` event will ever target it.
 *  2. Inline event handlers (`onbeforeinput="..."`) are a CSP /
 *     `script-src 'unsafe-inline'`-equivalent risk: any string-typed
 *     `onbeforeinput` attribute is executable JavaScript by the parser
 *     and bypasses React's synthetic-event delegation entirely.
 *  3. A stray `onbeforeinput="..."` would imply the filter rail is an
 *     editing surface, confusing assistive tech, IME stacks, and any
 *     tooling that introspects DOM event-handler provenance.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `onbeforeinput`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `onbeforeinput`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `onbeforeinput`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `onbeforeinput` (editing-host event handler).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` (quote
 *    source URL) — silent on `onbeforeinput`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `onbeforeinput`. A regression that added
 *    `onbeforeinput="handler(event)"` (e.g. by mistakenly templating
 *    an inline event-handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onbeforeinput") === false` AND
 * `track.getAttribute("onbeforeinput") === null`. `hasAttribute` is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `onbeforeinput` with an empty value is still authored,
 * and any string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforeinput attribute (W3204)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforeinput attribute", () => {
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

    // The pin: NO onbeforeinput attribute is authored on the chip strip.
    // A regression that adds `onbeforeinput=""`, `onbeforeinput="handler(event)"`,
    // or any other inline event-handler binding would fail here.
    expect(track!.hasAttribute("onbeforeinput")).toBe(false);
    expect(track!.getAttribute("onbeforeinput")).toBeNull();
  });
});
