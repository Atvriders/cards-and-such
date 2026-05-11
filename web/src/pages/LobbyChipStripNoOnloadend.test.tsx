import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onloadend` attribute.
 *
 * `onloadend` is an event-handler content attribute associated with
 * resource-loading interfaces (XMLHttpRequest, FileReader, etc.) — it
 * has no meaning on a plain `<div role="tablist">`. Authoring it on
 * the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it does not load any resource, so there is no
 *     `loadend` event to handle.
 *  2. As an unknown event-handler content attribute on a div, it is
 *     silently inert in HTML — but its presence is still flagged by
 *     validators (W3C Nu, html-validate) as an unknown attribute,
 *     polluting CI reports.
 *  3. A stray `onloadend="..."` would expose an inline handler string
 *     to CSP/XSS auditors, regardless of whether the browser ever
 *     fires the event.
 *
 * The pin: `track.hasAttribute("onloadend") === false` AND
 * `track.getAttribute("onloadend") === null`. Both forms are asserted
 * because the task spec calls for them explicitly.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onloadend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onloadend attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onloadend attribute is authored on the chip strip.
    expect(track!.hasAttribute("onloadend")).toBe(false);
    expect(track!.getAttribute("onloadend")).toBe(null);
  });
});
