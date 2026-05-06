import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2870 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `nonce` attribute.
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
 * `nonce` is a CSP (Content-Security-Policy) primitive used to
 * authorize inline `<script>` / `<style>` elements when a `nonce-...`
 * source is present in the response's CSP header. It has no defined
 * meaning on a plain `<div>` host element — adding it to a layout
 * container is at best dead weight, at worst a leakage vector
 * (because React serializes `nonce` props into the DOM, and the
 * IDL `HTMLElement.nonce` getter is intentionally hardened against
 * cross-origin script readout). A category filter rail must never
 * carry a server-generated nonce.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its `nonce` state.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `nonce`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `nonce`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `nonce`.
 *  - The various `LobbyChipStripNo*` pins enumerate absent ARIA /
 *    HTML attributes (no-id, no-name, no-style, no-tabindex,
 *    no-form, no-popover, no-part, no-slot, no-is, etc.) but none
 *    of them touch `nonce`, which is a CSP-scoped global attribute
 *    of its own.
 *  - None of the existing pins would catch a regression that added
 *    `nonce="..."` (e.g. via a misguided `{...rest}` spread of a
 *    `useNonce()` hook value) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("nonce") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* — it ignores the IDL
 * `HTMLElement.nonce` reflection (which jsdom may surface as `""`
 * even when the content attribute is unset) and only inspects the
 * authored content-attribute set.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other attribute of the element under test.
 */
describe("LobbyPage — .lobby-chips tablist has no nonce attribute (W2870)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a nonce attribute", () => {
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

    // The pin: NO `nonce` content attribute is authored on the chip
    // strip. A regression that spreads a CSP nonce prop onto the
    // tablist host (e.g. `<div nonce={cspNonce} ...>`) would fail
    // here, blocking accidental CSP-token leakage on a layout div.
    expect(track!.hasAttribute("nonce")).toBe(false);
  });
});
