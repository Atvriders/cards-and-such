import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3093 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `noresize` attribute.
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
 * `noresize` is a deprecated/obsolete HTML attribute whose only valid
 * historical host was `<frame>` inside a `<frameset>` (HTML 4.01),
 * where it prevented the user from resizing that frame pane. The
 * `<frame>`/`<frameset>` elements were removed from HTML5 in favor of
 * `<iframe>` — and even on `<frame>` the `noresize` attribute is now
 * obsolete. On a `<div role="tablist">` it is meaningless: no user
 * agent, no screen reader, and no spec consumer interprets `noresize`
 * on a non-frame element. Authoring it on the chip strip would be
 * wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a `<frame>` nor inside a `<frameset>`,
 *     so there is no frame-resize behaviour to suppress.
 *  2. Validators (W3C Nu, html-validate, axe) flag `noresize` on
 *     non-frame elements as an unknown/obsolete attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `noresize` or `noresize="noresize"` would imply the
 *     filter rail is a frame-pane with frozen geometry, confusing
 *     tooling that introspects DOM provenance (legacy frame
 *     introspectors, HTML4-era accessibility checkers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `noresize`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `noresize`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `noresize`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `noresize` (frame-resize lock).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `noresize`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `noresize`. A regression that added a
 *    `noresize` attribute (e.g. by mistakenly templating a
 *    legacy frame-style attribute onto the tablist) would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("noresize") === false` and
 * `track.getAttribute("noresize") === null`. `hasAttribute` (paired
 * with the `getAttribute(...) === null` companion) is the canonical
 * primitive for asserting absence of a legacy HTML attribute —
 * `noresize` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no noresize attribute (W3093)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a noresize attribute", () => {
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

    // The pin: NO noresize attribute is authored on the chip strip.
    // A regression that adds `noresize`, `noresize="noresize"`, or any
    // other frame-resize-lock binding would fail here.
    expect(track!.hasAttribute("noresize")).toBe(false);
    expect(track!.getAttribute("noresize")).toBeNull();
  });
});
