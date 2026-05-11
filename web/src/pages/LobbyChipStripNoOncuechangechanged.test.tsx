import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncuechangechanged` attribute.
 *
 * `oncuechangechanged` is not a real DOM event handler attribute.
 * The actual media-text-track event handler is `oncuechange`
 * (fired on a `TextTrack` when its active cues change). A
 * mistakenly-doubled / mistyped variant such as
 * `oncuechangechanged` would be a meaningless inline handler on a
 * `<div role="tablist">` because:
 *  1. The chip-strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a `<track>` / `TextTrack` host, so no
 *     cuechange-style event ever fires on it.
 *  2. Even on a legitimate `<track>` host, the only spec'd event
 *     handler is `oncuechange`, not `oncuechangechanged`.
 *  3. Inline event handler attributes on a non-host element are
 *     dead code at best and a tooling/CSP smell at worst.
 *
 * The pin: `track.hasAttribute("oncuechangechanged") === false`
 * AND `track.getAttribute("oncuechangechanged") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncuechangechanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncuechangechanged attribute", () => {
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

    // The pin: NO oncuechangechanged attribute is authored on the
    // chip strip.
    expect(track!.hasAttribute("oncuechangechanged")).toBe(false);
    expect(track!.getAttribute("oncuechangechanged")).toBeNull();
  });
});
