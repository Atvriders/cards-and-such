import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3294 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onrejectionhandled` attribute.
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
 * `onrejectionhandled` is a global event-handler attribute that fires
 * on `WindowEventHandlers` (i.e. `<body>` / `<frameset>` / the
 * `Window` object) when a previously rejected `Promise` has its
 * rejection handled. Authoring it as an inline DOM attribute on a
 * `<div role="tablist">` is wrong because:
 *  1. The chip strip is a presentational flex/scroll container of
 *     `role="tab"` buttons — it has no associated promise lifecycle
 *     and cannot meaningfully observe unhandled-rejection events.
 *  2. The `onrejectionhandled` IDL attribute is only reflected on
 *     `Window`, `<body>`, and `<frameset>` per the HTML spec — on a
 *     `<div>` it would be a stray inline-script string with no
 *     binding, a classic XSS / CSP smell.
 *  3. Validators (W3C Nu, html-validate) flag inline event-handler
 *     attributes on non-host elements, and CSP `script-src` policies
 *     that forbid `unsafe-inline` would reject any such handler at
 *     runtime — polluting CI accessibility / security reports.
 *
 * Why this needs its own pin separate from the existing `.lobby-chips`
 * pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its inline event-handler
 *    attributes.
 *  - W1330 / W1331 (LobbyChipStripAria*) pin `role === "tablist"`
 *    and the exact `aria-label` text — silent on `onrejectionhandled`.
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent on
 *    `onrejectionhandled` (promise-rejection event handler).
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global / legacy / event-handler attribute's absence — none of
 *    them currently cover `onrejectionhandled`. A regression that
 *    added `onrejectionhandled="alert(1)"` (e.g. by mistakenly
 *    templating a window-level event-handler attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("onrejectionhandled") === false` AND
 * `track.getAttribute("onrejectionhandled") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence —
 * `onrejectionhandled=""` (empty string) is still authored, and any
 * string value is a regression. The `getAttribute(...) === null`
 * companion check belt-and-braces the same invariant via the
 * complementary DOM accessor.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onrejectionhandled attribute (W3294)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onrejectionhandled attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO onrejectionhandled attribute is authored on the
    // chip strip. A regression that adds `onrejectionhandled=""`,
    // `onrejectionhandled="alert(1)"`, or any other inline
    // event-handler string would fail here.
    expect(track!.hasAttribute("onrejectionhandled")).toBe(false);
    expect(track!.getAttribute("onrejectionhandled")).toBeNull();
  });
});
