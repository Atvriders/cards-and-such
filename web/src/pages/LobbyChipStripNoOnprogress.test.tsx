import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onprogress` attribute.
 *
 * `onprogress` is the inline event-handler content attribute for the
 * `progress` event, which fires on a small set of elements such as
 * `<progress>`, `XMLHttpRequest`, media elements (`<video>`/`<audio>`),
 * and resource-loading elements (e.g. `<img>` via `Element.loading`
 * progress in some implementations). On a `<div role="tablist">` it is
 * meaningless: a non-progress, non-media container does not emit
 * `progress` events, so an authored `onprogress="..."` handler is dead
 * code at best, and at worst:
 *  1. A vector for inline-script execution that bypasses our normal
 *     React event delegation and any CSP that forbids inline handlers.
 *  2. A misleading signal to tooling that introspects authored
 *     attributes for "loading"/"download" affordances.
 *  3. An invalid-attribute lint flag in strict HTML validators.
 *
 * The chip strip is a flex/scroll container of `role="tab"` buttons —
 * it never loads a resource, so no `progress` event ever fires on it
 * regardless of whether `onprogress` is authored. Authoring it would
 * be wrong on every axis.
 *
 * The pin: `track.hasAttribute("onprogress") === false` and
 * `track.getAttribute("onprogress") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — there is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onprogress attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onprogress attribute", () => {
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

    // The pin: NO onprogress attribute is authored on the chip strip.
    expect(track!.hasAttribute("onprogress")).toBe(false);
    expect(track!.getAttribute("onprogress")).toBeNull();
  });
});
