import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ongamepaddisconnected` attribute.
 *
 * `ongamepaddisconnected` is the inline event-handler IDL attribute
 * for the Gamepad API's `gamepaddisconnected` event, valid only on
 * `<body>` and `<frameset>` as a Window-forwarded event handler.
 * Authoring it on a `<div role="tablist">` is meaningless:
 *  - The chip-strip tablist is a category filter rail, not a Window
 *    target — `gamepaddisconnected` fires at `window`, not at an
 *    arbitrary div.
 *  - Validators (html-validate, W3C Nu) flag inline event handlers
 *    on non-host elements as unknown attributes.
 *  - A stray `ongamepaddisconnected="..."` would imply gamepad
 *    lifecycle wiring on the lobby filter strip, which has nothing
 *    to do with input-device hotplug.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The pin uses
 * both `hasAttribute` and `getAttribute` to guard against any form
 * of regression (empty string vs. explicitly null).
 */
describe("LobbyPage — .lobby-chips tablist has no ongamepaddisconnected attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ongamepaddisconnected attribute", () => {
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

    // The pin: NO ongamepaddisconnected attribute is authored.
    expect(track!.hasAttribute("ongamepaddisconnected")).toBe(false);
    expect(track!.getAttribute("ongamepaddisconnected")).toBeNull();
  });
});
