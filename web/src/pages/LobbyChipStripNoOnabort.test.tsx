import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onabort` attribute.
 *
 * `onabort` is a legacy global event-handler content attribute. On a
 * `<div role="tablist">` it is meaningless: the chip strip is not a
 * resource-loading element (`<img>`, `<audio>`, `<video>`, `<object>`,
 * etc.) and never fires an `abort` event. Authoring an inline
 * `onabort="..."` handler on the tablist would:
 *  1. Inject an inline JavaScript string into the DOM, contradicting
 *     the project's CSP / no-inline-handler posture.
 *  2. Bind a handler for an event that the element will never dispatch,
 *     creating dead code that confuses readers and tooling.
 *  3. Slip past every other LobbyChipStripNo* pin, since none of them
 *     currently cover `onabort`.
 *
 * The pin: `track.hasAttribute("onabort") === false` AND
 * `track.getAttribute("onabort") === null`. Both forms together guard
 * against an authored empty-string `onabort=""` and any non-null value.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onabort attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onabort attribute", () => {
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

    // The pin: NO onabort attribute is authored on the chip strip.
    expect(track!.hasAttribute("onabort")).toBe(false);
    expect(track!.getAttribute("onabort")).toBeNull();
  });
});
