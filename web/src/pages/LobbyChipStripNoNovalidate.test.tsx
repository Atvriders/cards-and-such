import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2907 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `novalidate` attribute.
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
 * `novalidate` is a boolean attribute defined exclusively on the HTML
 * `<form>` element. It instructs the user agent to skip the
 * constraint-validation algorithm on form submission. On any non-form
 * host element it has no defined meaning, no UA behaviour, and no
 * accessibility implication — the HTML parser will accept it as an
 * unknown content attribute, but it is dead weight at best and a
 * confusing accessibility / DOM-hygiene smell at worst (it suggests
 * the author confused the tablist for a form, or copy-pasted a form
 * spread onto a layout div).
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its `novalidate` state.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `novalidate`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `novalidate`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `novalidate`.
 *  - The various form-adjacent absence pins on this same track —
 *    `LobbyChipStripNoForm`, `LobbyChipStripNoAction`,
 *    `LobbyChipStripNoMethod`, `LobbyChipStripNoEnctype` — each pin
 *    a *different* form-only attribute. None of them assert the
 *    absence of `novalidate`, which is its own boolean form-only
 *    attribute with its own potential regression vector (e.g. a
 *    `{...formProps}` spread that forwards `noValidate`).
 *  - None of the existing pins would catch a regression that added
 *    `novalidate=""` to the inner `<div class="lobby-chips"
 *    role="tablist">`.
 *
 * The pin: `track.hasAttribute("novalidate") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* of a boolean content
 * attribute — boolean attributes have no meaningful "value", so the
 * presence/absence of the content attribute itself is what matters.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other attribute of the element under test.
 */
describe("LobbyPage — .lobby-chips tablist has no novalidate attribute (W2907)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a novalidate attribute", () => {
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

    // The pin: NO `novalidate` content attribute is authored on the
    // chip strip. A regression that spreads a form prop bag onto the
    // tablist host (e.g. `<div novalidate ...>`) would fail here,
    // blocking accidental form-only attribute leakage onto a layout
    // div.
    expect(track!.hasAttribute("novalidate")).toBe(false);
  });
});
