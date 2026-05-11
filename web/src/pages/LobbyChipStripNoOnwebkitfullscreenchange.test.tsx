import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onwebkitfullscreenchange` attribute.
 *
 * `onwebkitfullscreenchange` is a legacy WebKit-prefixed inline event
 * handler attribute for the Fullscreen API's `fullscreenchange` event.
 * Authoring it on a `<div role="tablist">` filter strip would be wrong
 * because:
 *  1. The chip strip is not a fullscreen target — it does not enter or
 *     exit fullscreen, so there is no `fullscreenchange` event for it
 *     to listen to.
 *  2. Inline event handler attributes are a CSP / XSS surface that
 *     this codebase deliberately avoids — all event wiring goes
 *     through React's synthetic event system.
 *  3. The `webkit`-prefixed form is a deprecated vendor variant that
 *     modern browsers either ignore or map to the unprefixed event,
 *     so authoring it provides no functionality and only adds noise.
 *
 * The pin: `track.hasAttribute("onwebkitfullscreenchange") === false`
 * AND `track.getAttribute("onwebkitfullscreenchange") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onwebkitfullscreenchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwebkitfullscreenchange attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    expect(track!.hasAttribute("onwebkitfullscreenchange")).toBe(false);
    expect(track!.getAttribute("onwebkitfullscreenchange")).toBeNull();
  });
});
