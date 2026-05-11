import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncuechange` attribute.
 *
 * `oncuechange` is a media-text-track event handler IDL attribute
 * whose only meaningful host is a `<track>` element (or, via the
 * GlobalEventHandlers mixin, elements that surface text-track cue
 * change events). On a `<div role="tablist">` filter strip it is
 * semantically inert: the chip rail has no associated TextTrack, no
 * `<track>` children, and no cue model. Authoring it on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no media context and dispatches no
 *     `cuechange` events.
 *  2. A stray `oncuechange="..."` becomes an inline event handler
 *     string parsed by the HTML parser, which is a CSP-hostile
 *     pattern and a latent XSS surface.
 *  3. Validators (W3C Nu, html-validate) flag `oncuechange` on
 *     non-media-bearing elements as suspicious / never-fired,
 *     polluting CI accessibility reports.
 *
 * The pin: `track.hasAttribute("oncuechange") === false` AND
 * `track.getAttribute("oncuechange") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncuechange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncuechange attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO oncuechange attribute is authored on the chip strip.
    expect(track!.hasAttribute("oncuechange")).toBe(false);
    expect(track!.getAttribute("oncuechange")).toBeNull();
  });
});
