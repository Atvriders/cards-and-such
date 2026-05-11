import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onemptied` attribute.
 *
 * `onemptied` is a legacy HTML media event handler attribute fired
 * when a media element (`<audio>` / `<video>`) network state becomes
 * `NETWORK_EMPTY`. On a `<div role="tablist">` it is meaningless —
 * the chip strip is not a media element and will never dispatch an
 * `emptied` event. Authoring it would:
 *  1. Be flagged by validators (W3C Nu, html-validate) as an unknown
 *     handler on a non-media element.
 *  2. Imply media semantics on a tablist filter rail, confusing both
 *     tooling and assistive tech.
 *  3. Silently swallow a regression where a stray
 *     `onemptied="..."` string was templated onto the strip.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The pin uses
 * both `hasAttribute("onemptied") === false` and
 * `getAttribute("onemptied") === null` to cover the full surface of
 * absence assertions.
 */
describe("LobbyPage — .lobby-chips tablist has no onemptied attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onemptied attribute", () => {
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

    // The pin: NO onemptied attribute is authored on the chip strip.
    expect(track!.hasAttribute("onemptied")).toBe(false);
    expect(track!.getAttribute("onemptied")).toBe(null);
  });
});
