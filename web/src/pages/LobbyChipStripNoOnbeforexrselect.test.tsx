import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforexrselect` attribute.
 *
 * `onbeforexrselect` is a WebXR event handler attribute fired before
 * an XR (immersive VR/AR) selection event is dispatched on a target.
 * It is meaningful only inside an active WebXR session on a target
 * that participates in XR input selection. On the lobby chip-strip
 * tablist it is meaningless:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons rendered in a flat 2D DOM tree — it has no WebXR
 *     session, no XR input source, and no select-event pipeline.
 *  2. Authoring `onbeforexrselect="..."` would attach an inline
 *     handler that never fires here, while still exposing the
 *     handler string to validators and security scanners that
 *     flag inline event handlers as CSP violations.
 *  3. A stray `onbeforexrselect` would imply the chip rail is XR-
 *     interactive, confusing tooling that introspects DOM XR
 *     capability.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforexrselect attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforexrselect attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm this is the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onbeforexrselect attribute is authored.
    expect(track!.hasAttribute("onbeforexrselect")).toBe(false);
    expect(track!.getAttribute("onbeforexrselect")).toBe(null);
  });
});
