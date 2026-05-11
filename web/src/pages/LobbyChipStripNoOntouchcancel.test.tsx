import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontouchcancel` attribute.
 *
 * `ontouchcancel` is a legacy inline event-handler IDL attribute that,
 * when authored in HTML, runs the attribute value as a JavaScript
 * function body when the browser cancels an in-progress touch sequence
 * (e.g. the system interrupts the touch with a modal, gesture, or
 * scroll takeover). Authoring it on the chip strip would be wrong
 * because:
 *  1. Inline `on*` handlers bypass React's synthetic-event system and
 *     run outside the component tree — they cannot close over
 *     component state, ref to React refs, or participate in event
 *     batching / replay.
 *  2. CSP policies that disallow `unsafe-inline` for script will
 *     refuse to execute the handler, silently breaking the feature.
 *  3. The chip strip relies on React-managed pointer / touch handlers
 *     (`onTouchStart`, `onTouchMove`, `onTouchEnd`) wired through the
 *     synthetic event system; a stray inline `ontouchcancel="..."`
 *     would race with or shadow those handlers.
 *  4. A `ontouchcancel="alert(1)"`-style regression is a classic XSS
 *     vector if any part of that attribute value is templated from
 *     user-controlled state.
 *
 * The pin: `track.hasAttribute("ontouchcancel") === false` AND
 * `track.getAttribute("ontouchcancel") === null`. Both forms are
 * asserted so that an empty-string authored attribute
 * (`ontouchcancel=""`) — which `hasAttribute` would catch but a
 * `getAttribute(...) !== ""` check would not — and a non-empty
 * authored attribute are both pinned as regressions.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ontouchcancel attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontouchcancel attribute", () => {
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

    // The pin: NO ontouchcancel attribute is authored on the chip
    // strip. A regression that adds `ontouchcancel=""`,
    // `ontouchcancel="doSomething()"`, or any other inline event
    // handler binding would fail here.
    expect(track!.hasAttribute("ontouchcancel")).toBe(false);
    expect(track!.getAttribute("ontouchcancel")).toBeNull();
  });
});
