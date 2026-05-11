import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforetogglechanged` attribute.
 *
 * `onbeforetogglechanged` is not a standard HTML event attribute. The
 * spec defines `onbeforetoggle` (fired on popover/details elements
 * before their open state changes) and there is no
 * `beforetogglechanged` event in any current HTML/DOM specification.
 * Authoring `onbeforetogglechanged` on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is neither a popover nor a `<details>` element, so
 *     even the real `onbeforetoggle` would be meaningless here, let
 *     alone a non-existent `onbeforetogglechanged` variant.
 *  2. Validators (W3C Nu, html-validate) flag unknown event handler
 *     attributes as invalid, polluting CI reports.
 *  3. A stray inline-event-handler string would be parsed as a global
 *     attribute and ignored by the browser, but would still pollute
 *     the DOM and confuse tooling that introspects event-handler
 *     bindings.
 *
 * The pin: `track.hasAttribute("onbeforetogglechanged") === false` and
 * `track.getAttribute("onbeforetogglechanged") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforetogglechanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforetogglechanged attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // The pin: NO onbeforetogglechanged attribute is authored on the
    // chip strip. A regression that adds any value would fail here.
    expect(track!.hasAttribute("onbeforetogglechanged")).toBe(false);
    expect(track!.getAttribute("onbeforetogglechanged")).toBeNull();
  });
});
