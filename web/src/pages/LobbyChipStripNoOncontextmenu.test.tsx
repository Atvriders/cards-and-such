import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3155 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncontextmenu` attribute.
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
 * `oncontextmenu` is a legacy inline event handler attribute whose
 * value is parsed as a JavaScript function body invoked when the user
 * triggers the context menu (right-click / long-press) on the element.
 * On a `<div role="tablist">` filter rail it would be wrong because:
 *  1. Inline event handler attributes execute string-evaluated code,
 *     which is incompatible with strict CSP policies that forbid
 *     `unsafe-inline` for scripts.
 *  2. Hijacking the browser's native context menu on a tablist removes
 *     accessibility affordances (inspect element, copy text, spellcheck
 *     suggestions) without offering any user benefit on a filter strip.
 *  3. React event delegation already routes any contextmenu handling
 *     through the synthetic event system via `onContextMenu`; a DOM
 *     attribute `oncontextmenu` would bypass React's event pipeline and
 *     create dual-handler bugs.
 *  4. Validators and linters (eslint-plugin-react, react/no-unknown-property,
 *     html-validate) flag DOM `oncontextmenu` as an unknown / disallowed
 *     property in JSX output.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML event handlers.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `oncontextmenu`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a different
 *    legacy HTML attribute (quote source URL) and silent on
 *    `oncontextmenu` (context-menu event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `oncontextmenu`. A regression that added
 *    `oncontextmenu="return false"` (e.g. by mistakenly trying to
 *    disable right-click on the filter rail) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("oncontextmenu") === false` plus
 * `track.getAttribute("oncontextmenu") === null`. `hasAttribute`
 * (and `getAttribute(...) === null`) is the canonical primitive for
 * asserting absence of a legacy HTML event handler attribute —
 * `oncontextmenu=""` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncontextmenu attribute (W3155)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncontextmenu attribute", () => {
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

    // The pin: NO oncontextmenu attribute is authored on the chip strip.
    // A regression that adds `oncontextmenu=""`,
    // `oncontextmenu="return false"`, or any other inline handler
    // binding would fail here.
    expect(track!.hasAttribute("oncontextmenu")).toBe(false);
    expect(track!.getAttribute("oncontextmenu")).toBeNull();
  });
});
