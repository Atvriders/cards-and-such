import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin the absence of the `onnavigateerror` attribute on the inner
 * chip-strip track `.lobby-chips` (the `<div role="tablist">` filter
 * rail rendered inside LobbyPage.tsx).
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
 * `onnavigateerror` is the inline event-handler content attribute for
 * the Navigation API's `navigateerror` event, which fires on
 * `window.navigation` (the Navigation API singleton) when a same-document
 * navigation fails (e.g. an aborted `navigation.navigate()` intercept).
 * The attribute is only meaningful on `<body>` / `<frameset>` — where
 * window-reflected handler attributes are spec-defined — and never on a
 * `<div role="tablist">` filter rail. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it does not host its own browsing context and cannot
 *     receive Navigation API events.
 *  2. Validators (W3C Nu, html-validate) flag `onnavigateerror` on
 *     non-`<body>` elements as an unknown/invalid content attribute.
 *  3. A stray `onnavigateerror="..."` would be ignored by the browser
 *     yet still serialize into the DOM, confusing tooling that
 *     introspects event-handler attributes.
 *
 * The pin: `track.hasAttribute("onnavigateerror") === false` AND
 * `track.getAttribute("onnavigateerror") === null`. The double
 * assertion guards against both authored-empty-string regressions and
 * any non-null value binding.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onnavigateerror attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onnavigateerror attribute", () => {
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

    // The pin: NO onnavigateerror attribute is authored on the chip
    // strip. A regression that adds `onnavigateerror=""` or any
    // handler-string binding would fail here.
    expect(track!.hasAttribute("onnavigateerror")).toBe(false);
    expect(track!.getAttribute("onnavigateerror")).toBe(null);
  });
});
