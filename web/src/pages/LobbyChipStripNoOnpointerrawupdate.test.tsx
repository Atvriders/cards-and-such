import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpointerrawupdate` attribute.
 *
 * `onpointerrawupdate` is the inline event-handler content attribute
 * corresponding to the `pointerrawupdate` event (a high-frequency
 * Pointer Events extension that fires on every raw pointer movement,
 * including coalesced samples). It is meaningless on a
 * `<div role="tablist">` chip filter strip because:
 *  1. The chip strip's interactivity is implemented via React event
 *     props (`onPointerDown`, `onClick`, etc.) on the inner tab
 *     buttons — not via inline `on*` HTML attributes on the
 *     tablist container.
 *  2. An authored `onpointerrawupdate="..."` would attach a string-
 *     compiled handler at the HTML-attribute level, bypassing React's
 *     synthetic event system and risking double-dispatch / leak.
 *  3. None of the chip-strip's real input bindings (drag-to-scroll,
 *     wheel-to-scroll, keyboard arrow navigation) require raw
 *     uncoalesced pointer samples — `pointermove` granularity is more
 *     than sufficient.
 *
 * The pin: `track.hasAttribute("onpointerrawupdate") === false` AND
 * `track.getAttribute("onpointerrawupdate") === null`. Both forms
 * are asserted to catch either an empty-string authoring
 * (`onpointerrawupdate=""`) and a non-empty handler string.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The stable
 * className keeps the pin scoped to the chip filter strip and not
 * any sibling tablist elsewhere in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onpointerrawupdate attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpointerrawupdate attribute", () => {
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

    // The pin: NO onpointerrawupdate attribute is authored on the
    // chip strip. Both `hasAttribute` and `getAttribute` are asserted
    // to catch both empty-string and non-empty regressions.
    expect(track!.hasAttribute("onpointerrawupdate")).toBe(false);
    expect(track!.getAttribute("onpointerrawupdate")).toBeNull();
  });
});
