import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforescroll` attribute.
 *
 * `onbeforescroll` is not a standard HTML event handler attribute.
 * Authoring it on the chip-strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons. Scroll-related side effects are wired up through
 *     refs and React event listeners (e.g. `onScroll`), not via
 *     inline DOM attributes.
 *  2. As a non-standard attribute it would be flagged by HTML
 *     validators and linters as unknown — polluting CI reports.
 *  3. A stray `onbeforescroll="..."` would suggest inline-handler
 *     authoring style that violates this codebase's React-event
 *     conventions and any strict CSP that disallows inline JS.
 *
 * The pin asserts the attribute is absent in BOTH directions:
 *  - `hasAttribute("onbeforescroll") === false`
 *  - `getAttribute("onbeforescroll") === null`
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforescroll attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforescroll attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are anchored on the chip-strip tablist.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onbeforescroll attribute authored on the chip strip.
    expect(track!.hasAttribute("onbeforescroll")).toBe(false);
    expect(track!.getAttribute("onbeforescroll")).toBe(null);
  });
});
