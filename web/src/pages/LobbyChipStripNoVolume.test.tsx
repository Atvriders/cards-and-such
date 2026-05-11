import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3052 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `volume` attribute.
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
 * `volume` is a media-element IDL property (and historically a legacy
 * attribute consideration on `<audio>`/`<video>`) whose only meaningful
 * hosts are `HTMLMediaElement` subclasses — where it carries a 0..1
 * float controlling playback gain. On a `<div role="tablist">` it is
 * meaningless: no user agent, no screen reader, and no spec consumer
 * interprets `volume` on a non-media element. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no audio output, no playback API, and nothing
 *     to gain-control.
 *  2. Validators (W3C Nu, html-validate, axe) flag `volume` on
 *     non-media elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `volume="0.5"` would imply the filter rail has an audio
 *     stream, confusing tooling that introspects DOM for media
 *     elements (e.g. accessibility auditors that surface captions /
 *     transcripts requirements, automated media discovery crawlers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div — it does not introspect the inner tablist track at all.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `volume`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `volume`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `volume`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL).
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `volume`. A regression that added `volume="0.5"` (e.g. by
 *    mistakenly templating a media-element attribute onto the
 *    tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("volume") === false` and
 * `track.getAttribute("volume") === null`.
 * `hasAttribute` (rather than only `getAttribute(...) === null`) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `volume` with an empty value is still authored, and any
 * string value is a regression.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no volume attribute (W3052)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a volume attribute", () => {
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
    expect(track!.className).toContain("lobby-chips");

    // The pin: NO volume attribute is authored on the chip strip.
    // A regression that adds `volume=""`, `volume="0.5"`, or any
    // other media-gain binding would fail here.
    expect(track!.hasAttribute("volume")).toBe(false);
    expect(track!.getAttribute("volume")).toBeNull();
  });
});
