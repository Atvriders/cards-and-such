import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W3148 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onfocusout` inline event-handler attribute.
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
 * `onfocusout` is the legacy IDL/HTML inline event-handler attribute
 * that fires when an element (or one of its descendants) loses focus
 * (the bubbling counterpart of `focusout`). On a `<div role="tablist">`
 * authored via React, an inline `onfocusout="..."` attribute is the
 * wrong primitive for several reasons:
 *  1. React reconciles focus-loss using its synthetic `onBlur` system
 *     (which bridges the underlying `focusout` event). Emitting an
 *     inline HTML `onfocusout="..."` attribute into the DOM would
 *     bypass the synthetic event pipeline and execute its string body
 *     as raw JavaScript in the global scope.
 *  2. Inline event-handler attributes carry CSP `unsafe-inline` cost
 *     and are flagged by static analyzers, security linters, and CSP
 *     report-only deployments — they would surface as policy
 *     violations on the chip filter rail.
 *  3. A stray `onfocusout="window.location='...'"` on the tablist
 *     track would be an XSS sink waiting to happen if any portion of
 *     that string were ever templated from user input.
 *
 * Why this needs its own pin separate from the existing `.lobby-chips`
 * focus / blur pins:
 *  - LobbyChipStripNoOnblur (if present) pins absence of the bubbling
 *    `onblur` inline attribute — `onfocusout` is the related-but-
 *    distinct sibling event (focusout bubbles; blur historically does
 *    not) and would slip past any pin keyed on `onblur` alone.
 *  - LobbyChipStripNoOnfocus / LobbyChipStripNoOnfocusin pin the
 *    focus-gain side of the event pair — silent on focus-loss.
 *  - LobbyChipStripAria (W1330) and LobbyChipStripAriaLabelExact
 *    (W1331) pin `role` and `aria-label` text — silent on inline
 *    event-handler attributes.
 *  - The broad family of LobbyChipStripNo* attribute pins each cover
 *    one specific global/legacy/event-handler attribute. None of them
 *    currently cover `onfocusout`. A regression that added
 *    `onfocusout="..."` to the chip strip would slip past every
 *    existing pin.
 *
 * The pin: `track.hasAttribute("onfocusout") === false` AND
 * `track.getAttribute("onfocusout") === null`. `hasAttribute` is the
 * canonical primitive for asserting absence of an attribute (an
 * authored `onfocusout=""` with an empty body is still a regression);
 * the parallel `getAttribute(...) === null` assertion guards against
 * any future DOM polyfill or jsdom quirk that diverges the two
 * primitives.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onfocusout attribute (W3148)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onfocusout attribute", () => {
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
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onfocusout inline event-handler attribute is
    // authored on the chip strip. A regression that adds
    // `onfocusout=""`, `onfocusout="doSomething()"`, or any other
    // string body would fail here.
    expect(track!.hasAttribute("onfocusout")).toBe(false);
    expect(track!.getAttribute("onfocusout")).toBeNull();
  });
});
