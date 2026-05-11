import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3085 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `controls` attribute.
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
 * `controls` is a boolean HTML attribute whose only valid hosts are
 * the media elements `<audio>` and `<video>`, where it instructs the
 * user agent to render native playback controls (play/pause, scrub
 * bar, volume, etc.). On a `<div role="tablist">` it is meaningless:
 * no user agent will render media controls on a non-media element,
 * and no spec consumer interprets `controls` on a generic div.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a media element nor a media surrogate,
 *     so there is nothing to play, pause, or scrub.
 *  2. Validators (W3C Nu, html-validate, axe) flag `controls` on
 *     non-media elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `controls=""` would imply the filter rail is a media
 *     surface, confusing tooling that introspects DOM media
 *     provenance (e.g. media-element scanners, autoplay auditors,
 *     accessibility crawlers that look for caption tracks).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `controls`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `controls`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `controls`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `controls` (media playback toggle).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `controls`.
 *  - LobbyChipStripNoAriaControls pins absence of the ARIA
 *    `aria-controls` attribute — a different attribute entirely
 *    (`aria-controls` is the ARIA relationship pointing at controlled
 *    element IDs, whereas plain `controls` is the boolean HTML media
 *    attribute). A regression that added bare `controls` would slip
 *    past the aria-controls pin.
 *
 * The pin: `track.hasAttribute("controls") === false` AND
 * `track.getAttribute("controls") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a boolean HTML attribute — `controls` with an empty value is still
 * authored (and would in fact be truthy on a media element). The
 * `getAttribute(...) === null` companion check pins the same absence
 * from the value-retrieval angle.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no controls attribute (W3085)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a controls attribute", () => {
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

    // The pin: NO controls attribute is authored on the chip strip.
    // A regression that adds `controls=""`, `controls`, or any other
    // media-playback toggle binding would fail here.
    expect(track!.hasAttribute("controls")).toBe(false);
    expect(track!.getAttribute("controls")).toBeNull();
  });
});
