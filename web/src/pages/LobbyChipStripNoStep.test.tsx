import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2936 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `step` attribute.
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
 * `step` is an HTML attribute whose only valid host is
 * `<input>` (specifically the numeric/date/time input types: number,
 * range, date, datetime-local, month, week, time). On those inputs
 * `step` constrains the granularity of legal values and drives the
 * spinner UI. On a `<div role="tablist">` it is meaningless: no user
 * agent, no screen reader, and no spec consumer interprets `step` on
 * a non-input element. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a numeric input nor a range slider, so
 *     there is no granularity to constrain.
 *  2. Validators (W3C Nu, html-validate, axe) flag `step` on
 *     non-input elements as an unknown/invalid attribute, polluting
 *     CI accessibility reports.
 *  3. A stray `step="1"` would imply the filter rail is a steppable
 *     numeric control, confusing tooling that introspects DOM
 *     constraints (e.g. form-field analyzers, accessibility scanners
 *     that count steppable widgets, automated form fillers).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its legacy HTML attributes.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `step`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `step`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` on this element — orthogonal to `step`.
 *  - W2894 (LobbyChipStripNoCoords) pins absence of `coords` — a
 *    different legacy HTML attribute (image-map hotspot) and silent
 *    on `step` (input granularity).
 *  - W2903 (LobbyChipStripNoCite) pins absence of `cite` — a
 *    different legacy HTML attribute (quote source URL) and silent
 *    on `step`.
 *  - The broad family of LobbyChipStripNo* pins each pin one specific
 *    global/legacy attribute's absence — none of them currently cover
 *    `step`. A regression that added `step="1"` (e.g. by mistakenly
 *    templating an input-style attribute onto the tablist) would slip
 *    past every existing pin.
 *
 * The pin: `track.hasAttribute("step") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting absence of an HTML attribute —
 * `step` with an empty value is still authored, and any string value
 * is a regression. We additionally assert
 * `getAttribute("step") === null` as a belt-and-braces secondary
 * check.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no step attribute (W2936)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a step attribute", () => {
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

    // The pin: NO step attribute is authored on the chip strip.
    // A regression that adds `step=""`, `step="1"`, or any other
    // numeric-input granularity binding would fail here.
    expect(track!.hasAttribute("step")).toBe(false);
    expect(track!.getAttribute("step")).toBeNull();
  });
});
