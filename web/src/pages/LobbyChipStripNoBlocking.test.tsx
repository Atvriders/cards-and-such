import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2876 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered around LobbyPage.tsx
 * ~L2623-L2628) carries NO `blocking` attribute.
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
 * `blocking` is an HTML attribute defined by the WHATWG HTML spec
 * (https://html.spec.whatwg.org/multipage/urls-and-fetching.html#blocking-attributes)
 * for use on `<link>`, `<script>`, and `<style>` elements only. Its
 * sole token "render" instructs the user agent to defer rendering
 * until the associated subresource has been fully fetched and applied,
 * effectively turning the host element into a render-blocking barrier.
 *
 * `blocking` has no defined behavior on a plain `<div>` host element
 * — adding it to a layout container is at best dead weight, at worst
 * a footgun that hints at misuse of a render-blocking primitive on
 * a non-resource element. A category filter rail must never carry
 * a `blocking` attribute.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` / chip-strip pins:
 *  - W1286 (LobbyChipStripWrap) pins the OUTER `.lobby-chips-wrap`
 *    div (tagName + className) — it does not introspect the inner
 *    tablist track at all, let alone its `blocking` state.
 *  - W1330 (LobbyChipStripAria) pins `role === "tablist"` and the
 *    `aria-label` text on the inner track — silent on `blocking`.
 *  - W1331 (LobbyChipStripAriaLabelExact) pins the exact
 *    `aria-label` string — also silent on `blocking`.
 *  - W2754 (LobbyChipsNoAriaMultiselectable) pins absence of
 *    `aria-multiselectable` — orthogonal to `blocking`.
 *  - W2870 (LobbyChipStripNoNonce) pins absence of `nonce` — a
 *    different CSP-scoped global attribute, not `blocking`.
 *  - The various `LobbyChipStripNo*` pins enumerate absent ARIA /
 *    HTML attributes (no-id, no-name, no-style, no-tabindex,
 *    no-form, no-popover, no-part, no-slot, no-is, no-nonce, etc.)
 *    but none of them touch `blocking`, which is a render-pipeline
 *    attribute of its own.
 *  - None of the existing pins would catch a regression that added
 *    `blocking="render"` (e.g. via a misguided `{...rest}` spread or
 *    a copy-paste from a `<link>` / `<style>` element) to the inner
 *    `<div class="lobby-chips" role="tablist">`.
 *
 * The pin: `track.hasAttribute("blocking") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence* — it inspects the
 * authored content-attribute set directly, independent of any IDL
 * reflection that jsdom or a future spec revision might layer on top.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip and
 * does not depend on any other attribute of the element under test.
 */
describe("LobbyPage — .lobby-chips tablist has no blocking attribute (W2876)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT a blocking attribute", () => {
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

    // The pin: NO `blocking` content attribute is authored on the
    // chip strip. A regression that spreads a render-blocking prop
    // onto the tablist host (e.g. `<div blocking="render" ...>`) would
    // fail here, blocking misuse of a `<link>`/`<script>`/`<style>`-only
    // attribute on a layout div.
    expect(track!.hasAttribute("blocking")).toBe(false);
  });
});
