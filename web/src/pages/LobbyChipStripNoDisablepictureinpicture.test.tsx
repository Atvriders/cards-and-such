import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3097 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `disablepictureinpicture` attribute.
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
 * `disablepictureinpicture` is an HTML attribute whose only valid host
 * is `<video>` — it instructs the user agent to suppress the
 * picture-in-picture control / context-menu entry for that video
 * element. On a `<div role="tablist">` it is meaningless: no user
 * agent, no screen reader, and no spec consumer interprets
 * `disablepictureinpicture` on a non-video element. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it does not produce video frames, so there is no
 *     picture-in-picture surface to disable.
 *  2. Validators (W3C Nu, html-validate, axe) flag
 *     `disablepictureinpicture` on non-video elements as an
 *     unknown/invalid attribute, polluting CI accessibility reports.
 *  3. A stray `disablepictureinpicture=""` would imply the filter rail
 *     is a video host, confusing tooling that introspects DOM media
 *     capabilities (e.g. PiP availability scanners, media-control
 *     extractors, automated browser-feature probes).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its media-control attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on
 *    `disablepictureinpicture`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `disablepictureinpicture`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to
 *    `disablepictureinpicture`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `disablepictureinpicture` (PiP suppression).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — also a
 *    different legacy HTML attribute.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `disablepictureinpicture`. A regression that added
 *    `disablepictureinpicture=""` (e.g. by mistakenly templating a
 *    video-style attribute onto the tablist) would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("disablepictureinpicture") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null` alone) is
 * the canonical primitive for asserting absence of a legacy HTML
 * attribute — `disablepictureinpicture` with an empty value is still
 * authored, and any presence is a regression. We additionally pin
 * `getAttribute(...) === null` as a belt-and-braces check.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no disablepictureinpicture attribute (W3097)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a disablepictureinpicture attribute", () => {
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

    // The pin: NO disablepictureinpicture attribute is authored on
    // the chip strip. A regression that adds
    // `disablepictureinpicture=""` or any other value would fail here.
    expect(track!.hasAttribute("disablepictureinpicture")).toBe(false);
    expect(track!.getAttribute("disablepictureinpicture")).toBeNull();
  });
});
