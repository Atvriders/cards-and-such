import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerlockerror` attribute.
 *
 * `onpointerlockerror` is an inline event-handler attribute for the
 * Pointer Lock API — it fires on `document` when a
 * `requestPointerLock()` call fails. It has no meaning on a
 * `<div role="tablist">` filter rail: the chip strip neither requests
 * pointer lock nor is it a valid target for the pointer-lock error
 * event (which is dispatched to `document`, not arbitrary elements).
 * Authoring `onpointerlockerror="..."` on the chip strip would be:
 *  1. Dead code — the handler would never fire because the chip
 *     strip is not a pointer-lock event target.
 *  2. An inline-script vector that bypasses the project's CSP /
 *     event-binding conventions (handlers are wired via React props,
 *     not HTML attributes).
 *  3. A misleading provenance signal to validators and DOM
 *     introspection tools, which would treat the chip strip as
 *     participating in the Pointer Lock API.
 *
 * The pin: `track.hasAttribute("onpointerlockerror") === false` AND
 * `track.getAttribute("onpointerlockerror") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerlockerror attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerlockerror attribute", () => {
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

    // The pin: NO onpointerlockerror attribute is authored on the
    // chip strip. A regression that adds
    // `onpointerlockerror="..."` would fail here.
    expect(track!.hasAttribute("onpointerlockerror")).toBe(false);
    expect(track!.getAttribute("onpointerlockerror")).toBeNull();
  });
});
