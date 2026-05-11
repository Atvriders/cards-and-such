import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onended` attribute.
 *
 * `onended` is a media event handler attribute valid only on
 * `<audio>` and `<video>` elements — it fires when playback reaches
 * the end of the resource. On a `<div role="tablist">` it is
 * meaningless: there is no media stream to "end", no user agent
 * dispatches an `ended` event on a div, and authoring it would
 * either be dead code or, worse, a stray inline handler string that
 * eval-executes in legacy parsing paths.
 *
 * A regression that added `onended="..."` (e.g. by templating a
 * media-handler attribute onto the tablist) would slip past existing
 * pins that target other legacy/global attributes.
 *
 * The pin: `track.hasAttribute("onended") === false` and
 * `track.getAttribute("onended") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. Anchoring on the
 * stable className keeps the pin scoped to the chip filter strip
 * specifically (a sibling drawer tablist lives elsewhere in the tree).
 */
describe("LobbyPage — .lobby-chips tablist has no onended attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onended attribute", () => {
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

    // The pin: NO onended attribute is authored on the chip strip.
    expect(track!.hasAttribute("onended")).toBe(false);
    expect(track!.getAttribute("onended")).toBeNull();
  });
});
