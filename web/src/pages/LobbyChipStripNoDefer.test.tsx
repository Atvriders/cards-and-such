import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2964 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `defer` attribute.
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
 * `defer` is a boolean HTML attribute whose only valid host is
 * `<script>` — where it instructs the browser to defer script
 * execution until after the document has been parsed. On a
 * `<div role="tablist">` it is meaningless: no user agent, no script
 * loader, and no spec consumer interprets `defer` on a non-script
 * element. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it contains no executable script content, so there is
 *     nothing to defer.
 *  2. Validators (W3C Nu, html-validate, axe) flag `defer` on
 *     non-script elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `defer=""` would imply the filter rail is a script
 *     tag with deferred execution semantics, confusing tooling that
 *     introspects DOM provenance (e.g. CSP analyzers, script loaders,
 *     resource-hint extractors).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `defer`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `defer`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `defer`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `defer` (script execution timing).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `defer`.
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `defer`. A regression that added
 *    `defer` (e.g. by mistakenly templating a script-style attribute
 *    onto the tablist) would slip past every existing pin.
 *
 * The pin: `track.hasAttribute("defer") === false` AND
 * `track.getAttribute("defer") === null`.
 * `hasAttribute` is the canonical primitive for asserting absence of
 * a boolean HTML attribute — `defer` with no value is still authored,
 * and any presence is a regression. The `getAttribute(...) === null`
 * check is a belt-and-suspenders confirmation.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no defer attribute (W2964)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a defer attribute", () => {
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

    // The pin: NO defer attribute is authored on the chip strip.
    // A regression that adds `defer`, `defer=""`, or any other
    // script-execution-timing binding would fail here.
    expect(track!.hasAttribute("defer")).toBe(false);
    expect(track!.getAttribute("defer")).toBeNull();
  });
});
