import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onaudiostart` attribute.
 *
 * `onaudiostart` is a SpeechRecognition event handler attribute. It is
 * meaningful only on a `SpeechRecognition` instance (the JS API
 * surface), NOT as an HTML content attribute on a generic
 * `<div role="tablist">`. Authoring `onaudiostart="..."` on the chip
 * strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no speech-recognition lifecycle to hook into.
 *  2. Browsers do not expose `onaudiostart` as a content attribute on
 *     `HTMLDivElement`; any stringified handler would simply sit on
 *     the element as an unknown attribute, never fire, and pollute
 *     the DOM.
 *  3. Validators flag unknown `on*` handlers on non-relevant elements
 *     as suspicious — and inline event handlers are a CSP red flag.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onaudiostart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onaudiostart attribute", () => {
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

    // The pin: NO onaudiostart attribute is authored on the chip strip.
    expect(track!.hasAttribute("onaudiostart")).toBe(false);
    expect(track!.getAttribute("onaudiostart")).toBeNull();
  });
});
