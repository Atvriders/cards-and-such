import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onnavigate` attribute.
 *
 * `onnavigate` is the inline event-handler attribute for the
 * Navigation API's `navigate` event, which fires on `window.navigation`
 * when a same-document navigation begins. Authoring it as a content
 * attribute is meaningful only on the `<body>` element (where it maps
 * to `window.onnavigate`). On a `<div role="tablist">` chip strip it
 * is meaningless: navigation events do not dispatch to arbitrary divs,
 * and a stray `onnavigate="..."` on the tablist would either be
 * silently ignored by the browser or flagged by validators as an
 * unknown attribute on a non-body element.
 *
 * The pin: `track.hasAttribute("onnavigate") === false` and
 * `track.getAttribute("onnavigate") === null`. A regression that
 * added `onnavigate="handleNav()"` (e.g. by mistakenly forwarding a
 * navigation-event handler onto the tablist) would slip past every
 * existing chip-strip pin.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onnavigate attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onnavigate attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onnavigate attribute is authored on the chip strip.
    expect(track!.hasAttribute("onnavigate")).toBe(false);
    expect(track!.getAttribute("onnavigate")).toBeNull();
  });
});
