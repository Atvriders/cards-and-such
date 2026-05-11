import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondevicemotion` attribute.
 *
 * `ondevicemotion` is a legacy inline event-handler attribute valid
 * only on `<body>` (and via the Window object) — it fires when the
 * device's accelerometer reports motion. On a `<div role="tablist">`
 * it is meaningless and would never be invoked by any user agent.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no relation to device-orientation hardware
 *     and no need to react to physical motion of the device.
 *  2. Inline event-handler attributes on arbitrary elements are
 *     parsed but never dispatched for non-window-class events such
 *     as devicemotion — leaving dead code in the markup.
 *  3. A stray `ondevicemotion="..."` would imply the filter rail is
 *     hooking into accelerometer telemetry, confusing both static
 *     analysis (CSP unsafe-inline checks) and security audits.
 *
 * The pin: `track.hasAttribute("ondevicemotion") === false` AND
 * `track.getAttribute("ondevicemotion") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no ondevicemotion attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondevicemotion attribute", () => {
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

    // The pin: NO ondevicemotion attribute is authored on the chip strip.
    expect(track!.hasAttribute("ondevicemotion")).toBe(false);
    expect(track!.getAttribute("ondevicemotion")).toBeNull();
  });
});
