import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpresentationconnectionavailable` attribute.
 *
 * `onpresentationconnectionavailable` is the inline event-handler
 * content attribute for the Presentation API's
 * `connectionavailable` event, which fires on a
 * `PresentationRequest` instance when a presentation connection
 * has been established to a secondary display. It is meaningful
 * only on `PresentationRequest` JavaScript objects (and, by
 * Window-reflection, the global `window` event handler set) — it
 * is NOT a valid content attribute on a `<div role="tablist">`.
 *
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no relationship to the Presentation API,
 *     remote displays, or `PresentationRequest`/`PresentationConnection`.
 *  2. HTML defines `onpresentationconnectionavailable` as an
 *     IDL-level handler on `PresentationRequest`, not as a global
 *     event-handler content attribute on arbitrary elements, so
 *     validators flag it as unknown on a `<div>`.
 *  3. A stray inline handler string would be evaluated as code in
 *     a global scope it has no business touching, and would
 *     mislead tooling that scans for second-screen / casting
 *     integrations into thinking the lobby chip strip drives a
 *     presentation session.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips` pins:
 *  - The broad family of LobbyChipStripNo* pins each pin one
 *    specific global/legacy attribute's absence — none of them
 *    currently cover `onpresentationconnectionavailable`. A
 *    regression that added
 *    `onpresentationconnectionavailable="..."` would slip past
 *    every existing pin.
 *
 * The pin: `track.hasAttribute("onpresentationconnectionavailable") === false`
 * AND `track.getAttribute("onpresentationconnectionavailable") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on
 * the stable `.lobby-chips` className keeps the pin scoped
 * specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpresentationconnectionavailable attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpresentationconnectionavailable attribute", () => {
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

    // The pin: NO onpresentationconnectionavailable attribute is
    // authored on the chip strip.
    expect(track!.hasAttribute("onpresentationconnectionavailable")).toBe(false);
    expect(track!.getAttribute("onpresentationconnectionavailable")).toBeNull();
  });
});
