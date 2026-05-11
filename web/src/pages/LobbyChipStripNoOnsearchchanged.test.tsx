import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onsearchchanged` attribute.
 *
 * `onsearchchanged` is not a standard HTML event handler attribute on
 * any element, let alone a `<div role="tablist">`. The chip strip is a
 * flex/scroll container of `role="tab"` buttons — it does not host a
 * search input, does not emit search-changed events, and no user
 * agent dispatches an `searchchanged` event to it. Authoring such an
 * attribute would be both meaningless and a regression vector for
 * inline-handler injection.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onsearchchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsearchchanged attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onsearchchanged attribute is authored on the chip
    // strip. A regression that adds `onsearchchanged="..."` would fail
    // here.
    expect(track!.hasAttribute("onsearchchanged")).toBe(false);
    expect(track!.getAttribute("onsearchchanged")).toBeNull();
  });
});
