import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ongamepadconnected` attribute.
 *
 * `ongamepadconnected` is the inline event-handler attribute mirror
 * of the `gamepadconnected` event, which fires only on `Window` when
 * a Gamepad API device is connected. Authoring it as an inline
 * attribute on a `<div role="tablist">` would be wrong because:
 *  1. The `gamepadconnected` event targets `Window`, not arbitrary
 *     DOM elements — the attribute on a `<div>` is a no-op.
 *  2. Inline event-handler attributes are a CSP/security smell and
 *     get flagged by `unsafe-inline` audits.
 *  3. Any string value would imply the chip strip listens to gamepad
 *     connect events, which is false — the filter rail is purely a
 *     pointer/keyboard tablist.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — the stable
 * className keeps the pin scoped to the chip filter strip and not
 * any sibling tablist.
 */
describe("LobbyPage — .lobby-chips tablist has no ongamepadconnected attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ongamepadconnected attribute", () => {
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

    // The pin: NO ongamepadconnected attribute is authored on the
    // chip strip. A regression that adds `ongamepadconnected=""` or
    // any handler-string binding would fail here.
    expect(track!.hasAttribute("ongamepadconnected")).toBe(false);
    expect(track!.getAttribute("ongamepadconnected")).toBeNull();
  });
});
