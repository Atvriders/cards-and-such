import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpermissionchange` attribute.
 *
 * `onpermissionchange` is an event-handler content attribute associated
 * with `PermissionStatus` objects (Permissions API). It has no meaning
 * on an arbitrary `<div role="tablist">`:
 *  - No user agent dispatches a `permissionchange` event at a generic
 *    DOM element; the event fires on `PermissionStatus` instances
 *    obtained via `navigator.permissions.query(...)`.
 *  - As a content attribute on the chip strip, the string body would
 *    be parsed as an inline event handler — a CSP-hostile pattern and
 *    a maintenance footgun, since the handler would never actually
 *    run for permission state transitions.
 *  - HTML validators flag unknown `on*` attributes on non-applicable
 *    elements, polluting accessibility/lint CI reports.
 *
 * Pinning absence of `onpermissionchange` keeps the chip-strip's
 * attribute set deliberately minimal and guards against a regression
 * that templates a Permissions API handler onto an unrelated DOM
 * node.
 *
 * The pin: `track.hasAttribute("onpermissionchange") === false` and
 * `track.getAttribute("onpermissionchange") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onpermissionchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpermissionchange attribute", () => {
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

    // The pin: NO onpermissionchange attribute is authored on the
    // chip strip. A regression that adds
    // `onpermissionchange="..."` would fail here.
    expect(track!.hasAttribute("onpermissionchange")).toBe(false);
    expect(track!.getAttribute("onpermissionchange")).toBeNull();
  });
});
