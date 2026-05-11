import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Cap-10 — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onloadedmetadata` attribute.
 *
 * `onloadedmetadata` is an inline media event handler attribute whose
 * only meaningful hosts are `<audio>` and `<video>` elements — it
 * fires when the user agent has loaded enough media metadata
 * (duration, dimensions, tracks) to begin playback negotiation. On a
 * `<div role="tablist">` it is meaningless: a div is not a media
 * element, does not load media resources, and will never fire a
 * `loadedmetadata` event. Authoring it on the chip strip would be
 * wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — there is no `HTMLMediaElement` lifecycle here.
 *  2. Inline event-handler attributes are a CSP-hostile pattern and
 *     trip `script-src` / `unsafe-inline` audits.
 *  3. A stray `onloadedmetadata="..."` would imply this div is a
 *     media player, confusing tooling, assistive tech, and any
 *     consumer introspecting the DOM for media semantics.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The assertion
 * uses BOTH `hasAttribute` (false) and `getAttribute` (null) to pin
 * the attribute's complete absence on the inner tablist track.
 */
describe("LobbyPage — .lobby-chips tablist has no onloadedmetadata attribute (Cap-10)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onloadedmetadata attribute", () => {
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

    // The pin: NO onloadedmetadata attribute is authored on the chip strip.
    expect(track!.hasAttribute("onloadedmetadata")).toBe(false);
    expect(track!.getAttribute("onloadedmetadata")).toBe(null);
  });
});
