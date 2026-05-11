import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onwebkitfullscreenerror` attribute.
 *
 * `onwebkitfullscreenerror` is a legacy WebKit-prefixed inline event
 * handler attribute that fires when an element fails to enter
 * fullscreen mode via the `webkitRequestFullscreen` API. On a
 * `<div role="tablist">` filter rail it is meaningless: the chip
 * strip is not a fullscreen target and has no business binding inline
 * fullscreen error handlers. Authoring it on the chip strip would be
 * wrong because:
 *  1. The chip strip never calls `webkitRequestFullscreen`, so it
 *     will never dispatch a `webkitfullscreenerror` event — the
 *     handler would be dead code.
 *  2. Inline event handler attributes pollute CSP audits (they
 *     require `'unsafe-inline'` for scripts) and are widely flagged
 *     by security linters.
 *  3. The webkit-prefixed fullscreen API is legacy; standards
 *     consumers prefer the unprefixed `onfullscreenerror`. Mixing
 *     both forms on a non-fullscreen element is doubly wrong.
 *
 * The pin: `track.hasAttribute("onwebkitfullscreenerror") === false`
 * and `track.getAttribute("onwebkitfullscreenerror") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onwebkitfullscreenerror attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwebkitfullscreenerror attribute", () => {
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

    // The pin: NO onwebkitfullscreenerror attribute is authored on
    // the chip strip.
    expect(track!.hasAttribute("onwebkitfullscreenerror")).toBe(false);
    expect(track!.getAttribute("onwebkitfullscreenerror")).toBeNull();
  });
});
