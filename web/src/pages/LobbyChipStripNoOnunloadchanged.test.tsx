import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onunloadchanged` attribute.
 *
 * `onunloadchanged` is not a standard HTML event handler attribute on
 * any element — it is not part of the HTML living standard's set of
 * `onunload`/`beforeunload`/`pagehide` lifecycle hooks, which are only
 * valid on `<body>` / `<frameset>` / `Window`. Authoring
 * `onunloadchanged="..."` on a `<div role="tablist">` is meaningless:
 * no user agent will dispatch such an event, and the string value
 * would be inert markup pollution at best, or a confusing inline
 * handler at worst.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped to the chip filter
 * strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onunloadchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onunloadchanged attribute", () => {
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

    // The pin: NO onunloadchanged attribute is authored on the chip strip.
    expect(track!.hasAttribute("onunloadchanged")).toBe(false);
    expect(track!.getAttribute("onunloadchanged")).toBe(null);
  });
});
