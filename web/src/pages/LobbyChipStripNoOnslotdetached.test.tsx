import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onslotdetached` attribute.
 *
 * `onslotdetached` is not a standard HTML event handler attribute on
 * any element. The chip strip is a plain `<div role="tablist">` flex
 * container of `role="tab"` buttons — it is neither a `<slot>`
 * element nor a shadow-DOM host, so any slot-lifecycle event handler
 * authored on it would be meaningless. A regression that authored
 * `onslotdetached="..."` on the chip strip would:
 *  1. Be silently ignored by browsers (no slot lifecycle fires on a
 *     non-slot div), giving false confidence that the handler runs.
 *  2. Pollute the DOM with an inline event-handler-shaped string,
 *     which CSP-conscious environments and validators flag.
 *  3. Confuse tooling that introspects element attributes for
 *     declarative event bindings.
 *
 * The pin: `track.hasAttribute("onslotdetached") === false` AND
 * `track.getAttribute("onslotdetached") === null`. Both forms are
 * asserted to catch any regression that authors the attribute with
 * either an empty or non-empty value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. Anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip and not any sibling tablist in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onslotdetached attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onslotdetached attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we're looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onslotdetached attribute is authored on the chip strip.
    expect(track!.hasAttribute("onslotdetached")).toBe(false);
    expect(track!.getAttribute("onslotdetached")).toBeNull();
  });
});
