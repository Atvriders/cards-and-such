import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsuspend` attribute.
 *
 * `onsuspend` is a media-element event handler attribute, valid only
 * on media-bearing hosts (`<audio>`, `<video>`) where it fires when
 * the user agent intentionally suspends media data loading. On a
 * `<div role="tablist">` it is meaningless and would be either an
 * inline script handler regression (string-form `onsuspend="..."`) or
 * a DOM-level event-handler attribute leak. Either way, authoring it
 * on the chip strip is wrong.
 */
describe("LobbyPage — .lobby-chips tablist has no onsuspend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsuspend attribute", () => {
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

    // The pin: NO onsuspend attribute is authored on the chip strip.
    expect(track!.hasAttribute("onsuspend")).toBe(false);
    expect(track!.getAttribute("onsuspend")).toBeNull();
  });
});
