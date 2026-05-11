import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onaudioend` attribute.
 *
 * `onaudioend` is an event-handler content attribute associated with
 * the Web Speech API's `SpeechSynthesisUtterance` / audio playback
 * pipeline. It is not a global HTML event-handler attribute and has
 * no defined meaning on a generic `<div role="tablist">` filter rail.
 * Authoring it on the chip strip would be wrong because:
 *  1. The chip strip neither plays nor synthesises audio — it is a
 *     scroll container of `role="tab"` buttons.
 *  2. Validators flag unknown event-handler attributes on arbitrary
 *     elements, polluting CI accessibility reports.
 *  3. A stray `onaudioend="..."` would represent an inline event
 *     handler — a CSP-violating pattern that the codebase otherwise
 *     forbids on this element family.
 *
 * The pin: `track.hasAttribute("onaudioend") === false` AND
 * `track.getAttribute("onaudioend") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onaudioend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onaudioend attribute", () => {
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

    // The pin: NO onaudioend attribute is authored on the chip strip.
    expect(track!.hasAttribute("onaudioend")).toBe(false);
    expect(track!.getAttribute("onaudioend")).toBeNull();
  });
});
