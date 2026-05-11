import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncontextlost` attribute.
 *
 * `oncontextlost` is a (Canvas/WebGL-adjacent) event-handler content
 * attribute that fires when a rendering context is lost. It is
 * meaningless on a non-canvas `<div role="tablist">` — no spec
 * consumer dispatches a contextlost event to a flex/scroll container
 * of `role="tab"` buttons. Authoring it on the chip strip would be
 * wrong because:
 *  1. The chip strip is not a canvas/offscreen-canvas surface; there
 *     is no rendering context to lose.
 *  2. Inline `on*` content attributes execute their string value as
 *     a script — a stray `oncontextlost="..."` would be parsed as
 *     untrusted inline JS, a CSP/security regression.
 *  3. Validators flag unknown `on*` handlers on non-applicable
 *     elements as suspicious, polluting CI accessibility/lint
 *     reports.
 *
 * The pin: `track.hasAttribute("oncontextlost") === false` and
 * `track.getAttribute("oncontextlost") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no oncontextlost attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncontextlost attribute", () => {
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

    // The pin: NO oncontextlost attribute is authored on the chip strip.
    expect(track!.hasAttribute("oncontextlost")).toBe(false);
    expect(track!.getAttribute("oncontextlost")).toBe(null);
  });
});
