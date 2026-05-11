import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onratechange` attribute.
 *
 * `onratechange` is a media-element event handler attribute that
 * fires when the playback rate of an `<audio>` or `<video>` element
 * changes. On a `<div role="tablist">` chip-strip container it is
 * meaningless: there is no media playback, no playback rate, and
 * therefore no `ratechange` event will ever be dispatched. Authoring
 * `onratechange="..."` on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a media element and emits no media events.
 *  2. An inline `onratechange="..."` attribute is an inline event
 *     handler, which violates strict CSP (`script-src` without
 *     `'unsafe-inline'`) and any inline-handler lint rules.
 *  3. A stray `onratechange` would imply media wiring on the filter
 *     rail, confusing static analyzers, accessibility audits, and
 *     anyone reading the DOM.
 *
 * The pin: `track.hasAttribute("onratechange") === false` AND
 * `track.getAttribute("onratechange") === null`. Both forms are
 * asserted to catch both authored-empty-string and missing cases.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onratechange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onratechange attribute", () => {
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

    // The pin: NO onratechange attribute is authored on the chip strip.
    expect(track!.hasAttribute("onratechange")).toBe(false);
    expect(track!.getAttribute("onratechange")).toBeNull();
  });
});
