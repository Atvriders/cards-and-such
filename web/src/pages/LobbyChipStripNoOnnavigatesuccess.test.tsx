import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onnavigatesuccess` attribute.
 *
 * `onnavigatesuccess` is the inline event-handler attribute for the
 * Navigation API's `navigatesuccess` event, which is only meaningful on
 * `window.navigation` (the global Navigation object). It is NOT a valid
 * content attribute on any HTML element — least of all on a
 * `<div role="tablist">` filter rail. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no relationship to the Navigation API and does
 *     not dispatch `navigatesuccess` events.
 *  2. Validators (W3C Nu, html-validate) flag unknown `on*` attributes
 *     on arbitrary elements as invalid content attributes.
 *  3. A stray `onnavigatesuccess="..."` would inject inline JavaScript
 *     into the DOM, contradicting the project's no-inline-handlers
 *     policy and potentially confusing CSP audits.
 *
 * The pin: `track.hasAttribute("onnavigatesuccess") === false` AND
 * `track.getAttribute("onnavigatesuccess") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The stable
 * `.lobby-chips` className scopes the pin specifically to the chip
 * filter strip, not any sibling tablist in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onnavigatesuccess attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onnavigatesuccess attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onnavigatesuccess attribute is authored on the chip
    // strip. A regression adding `onnavigatesuccess=""` or any inline
    // handler string would fail here.
    expect(track!.hasAttribute("onnavigatesuccess")).toBe(false);
    expect(track!.getAttribute("onnavigatesuccess")).toBeNull();
  });
});
