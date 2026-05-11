import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondevicestart` attribute.
 *
 * `ondevicestart` is not a standard HTML / DOM event attribute. It
 * appears in some legacy ActiveX / Windows-RT / Cordova-era device
 * orientation surfaces, and is meaningless on a `<div role="tablist">`
 * in a modern web app. Authoring it on the chip strip would be wrong
 * because:
 *  1. No mainstream browser dispatches a `devicestart` event to DOM
 *     elements — an inline `ondevicestart="..."` handler would never
 *     fire, and would just sit in the DOM as dead string content.
 *  2. Inline event-handler attributes named after non-standard events
 *     are a known XSS / dead-code smell — linters and CSP auditors
 *     flag them.
 *  3. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no device-lifecycle responsibility whatsoever.
 *
 * The pin: both `hasAttribute("ondevicestart") === false` AND
 * `getAttribute("ondevicestart") === null`. Either form of regression
 * (an empty `ondevicestart=""` or a populated handler string) fails
 * the assertion.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondevicestart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondevicestart attribute", () => {
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

    // The pin: NO ondevicestart attribute is authored on the chip strip.
    expect(track!.hasAttribute("ondevicestart")).toBe(false);
    expect(track!.getAttribute("ondevicestart")).toBe(null);
  });
});
