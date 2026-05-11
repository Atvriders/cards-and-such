import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onorientationchange` attribute.
 *
 * `onorientationchange` is a legacy inline event-handler content
 * attribute associated with the deprecated `window.orientation` API.
 * On a `<div role="tablist">` it is meaningless: the attribute only
 * has effect when authored on the `<body>` element (where it mirrors
 * `window.onorientationchange`). Authoring it on the chip-strip
 * tablist track would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no orientation semantics tied to the screen.
 *  2. The Screen Orientation API has superseded
 *     `window.orientation` / `onorientationchange`; placing the
 *     legacy handler on a non-body element does nothing useful.
 *  3. A stray `onorientationchange="..."` inline-handler string would
 *     be a CSP-unsafe inline event handler regression — exactly the
 *     kind of authored-attribute drift these pins exist to catch.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped to the chip
 * filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onorientationchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onorientationchange attribute", () => {
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

    // The pin: NO onorientationchange attribute is authored on the
    // chip strip. A regression that adds
    // `onorientationchange="..."` would fail here.
    expect(track!.hasAttribute("onorientationchange")).toBe(false);
    expect(track!.getAttribute("onorientationchange")).toBeNull();
  });
});
