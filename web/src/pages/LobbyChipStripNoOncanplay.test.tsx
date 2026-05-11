import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncanplay` attribute.
 *
 * `oncanplay` is a legacy inline event-handler content attribute whose
 * only meaningful hosts are media elements (`<audio>`, `<video>`) where
 * it fires when the user agent can resume playback. On a
 * `<div role="tablist">` it is meaningless: the chip strip is not a
 * media element, has no media resource, and will never raise a
 * `canplay` event. Authoring `oncanplay="..."` on the chip strip would
 * be wrong because:
 *  1. It is a non-media flex/scroll container of `role="tab"` buttons —
 *     there is no media pipeline to be ready to play.
 *  2. Inline event-handler attributes bypass our React event system and
 *     execute arbitrary code as a string, which is a CSP / XSS smell.
 *  3. Validators flag `oncanplay` on non-media elements as misuse of a
 *     media-only event handler.
 *
 * The pin: `track.hasAttribute("oncanplay") === false` AND
 *           `track.getAttribute("oncanplay") === null`.
 */
describe("LobbyPage — .lobby-chips tablist has no oncanplay attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncanplay attribute", () => {
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

    // The pin: NO oncanplay attribute is authored on the chip strip.
    expect(track!.hasAttribute("oncanplay")).toBe(false);
    expect(track!.getAttribute("oncanplay")).toBeNull();
  });
});
