import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondragend` attribute.
 *
 * The element's authored attribute set is intentionally minimal:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *
 * `ondragend` is a global HTML event-handler content attribute that
 * fires when a drag operation initiated on the element ends (whether
 * by drop or cancel). On a `<div role="tablist">` filter rail it is
 * meaningless and dangerous to author for several reasons:
 *  1. The chip strip is NOT a drag source — its child chips are
 *     `role="tab"` buttons that the user clicks/keys to filter the
 *     lobby list. There is no drag-and-drop UX on this element.
 *     Authoring `ondragend="..."` would imply a drag interaction the
 *     component does not support.
 *  2. Inline event-handler content attributes (`onclick`,
 *     `ondragend`, `onmouseover`, ...) are an inline-script vector.
 *     React deliberately routes event handling through its synthetic
 *     event system and prop-form camelCase handlers
 *     (`onDragEnd={...}`) — those compile to `addEventListener`
 *     calls, NOT to DOM attributes.
 *  3. A stray `ondragend="alert(1)"` (or any other JS payload) on a
 *     server-rendered tablist would be a textbook stored-XSS sink if
 *     the value ever derived from user input.
 *
 * The pin: `track.hasAttribute("ondragend") === false` AND
 * `track.getAttribute("ondragend") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ondragend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondragend attribute", () => {
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

    // The pin: NO ondragend attribute is authored on the chip strip.
    expect(track!.hasAttribute("ondragend")).toBe(false);
    expect(track!.getAttribute("ondragend")).toBeNull();
  });
});
