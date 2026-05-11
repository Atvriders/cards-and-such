import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onplaying` attribute.
 *
 * `onplaying` is a media element event-handler content attribute whose
 * only meaningful hosts are `<audio>` and `<video>` — it fires when a
 * media element transitions out of the paused/waiting state and begins
 * playback. On a `<div role="tablist">` it is meaningless: the chip
 * strip is not a media element, has no playback state, and cannot fire
 * a `playing` event. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no `HTMLMediaElement` interface, so the
 *     `onplaying` IDL slot is never wired up by the parser.
 *  2. Validators (W3C Nu, html-validate) flag `onplaying` on
 *     non-media elements as an unexpected event-handler attribute,
 *     polluting CI accessibility/conformance reports.
 *  3. A stray `onplaying="..."` would imply the filter rail is a
 *     playable media surface, confusing tooling that introspects DOM
 *     event-handler provenance (e.g. media analytics, autoplay
 *     auditors).
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onplaying attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onplaying attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element. The pin only carries weight if the element
    // is in fact the role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onplaying attribute is authored on the chip strip.
    expect(track!.hasAttribute("onplaying")).toBe(false);
    expect(track!.getAttribute("onplaying")).toBe(null);
  });
});
