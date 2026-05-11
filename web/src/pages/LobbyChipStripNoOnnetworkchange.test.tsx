import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onnetworkchange` attribute.
 *
 * `onnetworkchange` is not a standard HTML/DOM event handler attribute.
 * It does not appear in the HTML Living Standard's global event handler
 * content-attribute list, nor in the DOM `GlobalEventHandlers` mixin.
 * Network connectivity change events are surfaced via the
 * `NetworkInformation` interface (`navigator.connection.onchange`) and
 * the `online`/`offline` events on `window` — none of which are
 * authored as DOM content attributes on arbitrary elements. Putting
 * `onnetworkchange="..."` on the chip strip would be wrong because:
 *  1. It is not a recognized event handler attribute — no user agent
 *     wires it up to any event source, so it would be inert dead code.
 *  2. Validators (W3C Nu, html-validate) flag unknown `on*` attributes
 *     as invalid, polluting CI reports.
 *  3. Its presence would mislead readers and tooling into thinking the
 *     chip strip reacts to network connectivity changes, when in fact
 *     the lobby's network handling lives elsewhere in the React tree.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onnetworkchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onnetworkchange attribute", () => {
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

    // The pin: NO onnetworkchange attribute is authored on the chip strip.
    expect(track!.hasAttribute("onnetworkchange")).toBe(false);
    expect(track!.getAttribute("onnetworkchange")).toBeNull();
  });
});
