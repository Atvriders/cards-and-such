import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onappinstalledchanged` attribute.
 *
 * `onappinstalledchanged` is not a standard event handler attribute
 * on any HTML element — there is no `appinstalledchanged` event in
 * the HTML or Web App Manifest spec (the related event is
 * `appinstalled` on `window`, dispatched after a PWA install). A
 * stray `onappinstalledchanged="..."` on a `<div role="tablist">`
 * would be:
 *  1. A no-op handler — no user agent will ever fire such an event,
 *     so the bound code is dead weight that ships to every client.
 *  2. A potential XSS sink if the value is interpolated from user
 *     input — inline event handlers execute attribute strings as
 *     JavaScript when the (nonexistent) event would fire, and
 *     tooling that lints inline-handler authoring would flag it.
 *  3. Misleading to readers who scan the DOM — implying the chip
 *     strip has app-install lifecycle concerns when it is a pure
 *     filter rail.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The pin uses
 * both `hasAttribute` (the canonical primitive for asserting
 * absence) and `getAttribute(...) === null` to defend against any
 * regression that authors the attribute with any value (including
 * empty string).
 */
describe("LobbyPage — .lobby-chips tablist has no onappinstalledchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onappinstalledchanged attribute", () => {
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

    // The pin: NO onappinstalledchanged attribute is authored.
    expect(track!.hasAttribute("onappinstalledchanged")).toBe(false);
    expect(track!.getAttribute("onappinstalledchanged")).toBeNull();
  });
});
