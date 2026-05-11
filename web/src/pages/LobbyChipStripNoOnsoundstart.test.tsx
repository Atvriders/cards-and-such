import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsoundstart` attribute.
 *
 * `onsoundstart` is a legacy inline event-handler content attribute
 * historically associated with the Web Speech API's
 * SpeechRecognition `soundstart` event. It is not a meaningful
 * attribute on a `<div role="tablist">` filter rail:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons, not a speech-recognition surface — there is no sound
 *     stream whose start it could observe.
 *  2. Validators (W3C Nu, html-validate, axe) flag unknown inline
 *     event handlers on arbitrary elements as invalid attributes,
 *     polluting CI accessibility reports.
 *  3. A stray `onsoundstart="..."` would imply executable JS bound
 *     directly via an HTML attribute, bypassing the React event
 *     system — a serious code-smell and a potential XSS sink.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onsoundstart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsoundstart attribute", () => {
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

    // The pin: NO onsoundstart attribute is authored on the chip strip.
    expect(track!.hasAttribute("onsoundstart")).toBe(false);
    expect(track!.getAttribute("onsoundstart")).toBeNull();
  });
});
