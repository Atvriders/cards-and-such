import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3168 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oninput` attribute.
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
 * `oninput` is a legacy inline event handler attribute. Its only
 * meaningful hosts are form controls that emit an `input` event —
 * `<input>`, `<textarea>`, `<select>`, and `contenteditable`
 * elements. On a `<div role="tablist">` it is meaningless: the chip
 * strip is a flex/scroll container of `role="tab"` buttons, never
 * emits an `input` event, and any inline `oninput="..."` string
 * would either be dead code (never fired) or — worse — an inline
 * JavaScript handler bypassing React's synthetic event system and
 * the project's CSP. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is not a form control and does not produce
 *     `input` events, so an `oninput` handler has nothing to bind.
 *  2. Inline event-handler attributes (`onclick`, `oninput`, etc.)
 *     are flagged by CSP `script-src` policies that disallow
 *     `unsafe-inline`, breaking the page under a strict CSP.
 *  3. They short-circuit React's event delegation: an inline string
 *     handler runs in the global scope, not inside React's
 *     reconciler, leading to stale closures and untestable behavior.
 *  4. Validators (W3C Nu, html-validate, axe) flag inline event
 *     handlers as code-smell / security warnings, polluting CI
 *     accessibility and security reports.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div — it does not introspect the inner tablist track at all.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `oninput`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `oninput`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to inline
 *    event handlers.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a legacy
 *    quote-source URL attribute, silent on inline event handlers.
 *  - The broad family of LobbyChipStripNo* pins each cover one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `oninput`. A regression that added
 *    `oninput="..."` (e.g. by mistakenly templating a form-control
 *    handler onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("oninput") === false` and
 * `track.getAttribute("oninput") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of an inline event
 * handler — `oninput=""` with an empty value is still authored, and
 * any string value is a regression. The dual assertion gives belt
 * and braces coverage against both forms.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oninput attribute (W3168)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oninput attribute", () => {
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

    // The pin: NO oninput attribute is authored on the chip strip.
    // A regression that adds `oninput=""`, `oninput="doSomething()"`,
    // or any other inline input-event handler binding would fail here.
    expect(track!.hasAttribute("oninput")).toBe(false);
    expect(track!.getAttribute("oninput")).toBeNull();
  });
});
