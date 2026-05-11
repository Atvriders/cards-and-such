import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3162 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncut` attribute.
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
 * `oncut` is a legacy HTML inline event-handler attribute that fires
 * when the user initiates a cut operation (typically Ctrl/Cmd+X) on an
 * editable element. Its only meaningful hosts are elements that can
 * actually participate in a cut: form controls (`<input>`,
 * `<textarea>`), `contenteditable` containers, or the document itself.
 * On a `<div role="tablist">` it is meaningless because:
 *  1. The chip strip is a non-editable flex/scroll container of
 *     `role="tab"` buttons — there is no text selection model and no
 *     content can be cut from it. The handler would simply never fire.
 *  2. Inline event-handler attributes are a Content-Security-Policy
 *     foot-gun: any project shipping a strict `script-src` CSP without
 *     `'unsafe-inline'` would have inline handlers rejected, and even
 *     under a permissive CSP they bypass React's synthetic-event
 *     delegation, leaking event-handler state outside the component
 *     lifecycle.
 *  3. Validators (W3C Nu, html-validate, axe, eslint-plugin-react)
 *     flag inline event-handler attributes (`onclick`, `oncut`,
 *     `oncopy`, `onpaste`, ...) on JSX as anti-patterns — React
 *     handlers belong as camelCase props (`onCut`) wired through the
 *     synthetic-event system, not as raw HTML attributes serialized
 *     into the DOM.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `oncut`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `oncut`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to inline event handlers.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `oncut`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `oncut`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `oncut`. A regression that added
 *    `oncut="alert(1)"` (e.g. by mistakenly templating an inline
 *    clipboard handler onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("oncut") === false` AND
 * `track.getAttribute("oncut") === null`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of a legacy HTML
 * attribute — `oncut` with an empty value is still authored, and any
 * string value is a regression. We assert both for belt-and-braces
 * coverage of the absence invariant.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncut attribute (W3162)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncut attribute", () => {
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

    // The pin: NO oncut attribute is authored on the chip strip.
    // A regression that adds `oncut=""`, `oncut="alert(1)"`, or any
    // other inline cut-event handler binding would fail here.
    expect(track!.hasAttribute("oncut")).toBe(false);
    expect(track!.getAttribute("oncut")).toBeNull();
  });
});
