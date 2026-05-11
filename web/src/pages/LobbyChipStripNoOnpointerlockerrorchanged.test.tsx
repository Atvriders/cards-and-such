import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerlockerrorchanged` attribute.
 *
 * `onpointerlockerrorchanged` is not a standard DOM event handler
 * attribute. The Pointer Lock API exposes `pointerlockerror` (without
 * the `changed` suffix) on `document`, and there is no
 * `onpointerlockerrorchanged` global event handler defined by any
 * specification or implemented by any user agent. Authoring such an
 * attribute on a `<div role="tablist">` would be wrong because:
 *  1. The chip strip is a filter rail of `role="tab"` buttons — it
 *     does not request or release pointer lock, so even a real
 *     `onpointerlockerror` handler would be meaningless here.
 *  2. The `changed` suffix variant does not exist; an authored
 *     `onpointerlockerrorchanged="..."` would be a stringly-typed
 *     no-op that pollutes the DOM and confuses event-binding audits.
 *  3. Validators flag unknown `on*` attributes as invalid, and
 *     pointer-lock instrumentation belongs on `document`, never on a
 *     non-canvas tablist container.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerlockerrorchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerlockerrorchanged attribute", () => {
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

    // The pin: NO onpointerlockerrorchanged attribute is authored.
    expect(track!.hasAttribute("onpointerlockerrorchanged")).toBe(false);
    expect(track!.getAttribute("onpointerlockerrorchanged")).toBe(null);
  });
});
