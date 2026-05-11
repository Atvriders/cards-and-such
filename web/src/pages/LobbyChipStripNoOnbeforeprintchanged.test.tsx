import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforeprintchanged` attribute.
 *
 * `onbeforeprintchanged` is not a standard DOM event handler — there
 * is no such event in the HTML Living Standard (the print-related
 * events are `beforeprint` and `afterprint`, exposed as
 * `onbeforeprint` / `onafterprint`). Authoring an attribute named
 * `onbeforeprintchanged` on a `<div role="tablist">` would be wrong
 * because:
 *  1. No user agent dispatches a `beforeprintchanged` event; the
 *    handler would never fire.
 *  2. Validators flag unknown `on*` handlers as invalid attributes,
 *    polluting CI accessibility/HTML reports.
 *  3. A stray inline handler string would be parsed as a global event
 *    listener body in some legacy contexts, creating an XSS surface.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforeprintchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforeprintchanged attribute", () => {
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

    // The pin: NO `onbeforeprintchanged` attribute is authored on the
    // chip strip.
    expect(track!.hasAttribute("onbeforeprintchanged")).toBe(false);
    expect(track!.getAttribute("onbeforeprintchanged")).toBeNull();
  });
});
