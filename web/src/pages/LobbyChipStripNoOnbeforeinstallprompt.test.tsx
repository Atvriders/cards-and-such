import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforeinstallprompt` attribute.
 *
 * `onbeforeinstallprompt` is the event-handler IDL attribute for the
 * `beforeinstallprompt` event, fired by Chromium-family browsers on
 * `window` (not arbitrary DOM nodes) when a PWA install prompt is
 * about to be shown. Authoring it inline on a `<div role="tablist">`
 * is wrong because:
 *  1. The event only dispatches on `window`, never bubbling through
 *     a filter-rail tablist — an inline handler on the chip strip is
 *     dead code.
 *  2. Validators flag `onbeforeinstallprompt` on a non-window element
 *     as an unknown/invalid attribute.
 *  3. A stray `onbeforeinstallprompt="..."` inline string would be
 *     compiled into an event-handler function on the element and
 *     could execute attacker-controlled JS if the value were ever
 *     templated from untrusted input.
 *
 * The pin: `track.hasAttribute("onbeforeinstallprompt") === false`
 * AND `track.getAttribute("onbeforeinstallprompt") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforeinstallprompt attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforeinstallprompt attribute", () => {
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

    // The pin: NO onbeforeinstallprompt attribute is authored.
    expect(track!.hasAttribute("onbeforeinstallprompt")).toBe(false);
    expect(track!.getAttribute("onbeforeinstallprompt")).toBeNull();
  });
});
