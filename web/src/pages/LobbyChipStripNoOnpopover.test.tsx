import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpopover` attribute.
 *
 * `onpopover` is not a defined HTML event-handler content attribute.
 * The Popover API uses `popovertoggle` / `beforetoggle` / `toggle`
 * events (and the corresponding `onbeforetoggle` / `ontoggle` content
 * attributes on popover-bearing elements). There is no `onpopover`
 * event handler in any spec. Authoring `onpopover="..."` on a
 * `<div role="tablist">` would be wrong because:
 *  1. The chip strip is not a popover invoker or popover target —
 *     it carries no `popover` / `popovertarget` / `popovertargetaction`
 *     attributes (see W2754 family pins), so there is no popover
 *     lifecycle event to listen for.
 *  2. `onpopover` is not a recognized event handler attribute, so
 *     the browser would simply store the value as a string attribute
 *     and never wire up a listener — a silent dead-code regression.
 *  3. Inline event-handler content attributes are forbidden under
 *     strict CSP (`script-src` without `unsafe-inline`); pinning
 *     their absence prevents accidental CSP regressions.
 *
 * The pin: `track.hasAttribute("onpopover") === false` AND
 * `track.getAttribute("onpopover") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onpopover attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpopover attribute", () => {
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

    // The pin: NO onpopover attribute is authored on the chip strip.
    expect(track!.hasAttribute("onpopover")).toBe(false);
    expect(track!.getAttribute("onpopover")).toBe(null);
  });
});
