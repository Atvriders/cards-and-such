import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onstoragechanged` attribute.
 *
 * `onstoragechanged` is not a standard DOM event handler attribute.
 * Authoring it inline on the chip strip would be meaningless: the
 * Storage events spec defines `storage` (fired on `Window`), not
 * `storagechanged`, and event handler IDL attributes are only valid
 * on the host elements defined by HTML. On a `<div role="tablist">`
 * it is dead weight at best and at worst surfaces as an invalid /
 * unknown attribute in accessibility and HTML validators.
 *
 * The pin: `track.hasAttribute("onstoragechanged") === false` and
 * `track.getAttribute("onstoragechanged") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — keeps the pin
 * scoped to the chip filter strip specifically, not a sibling
 * tablist elsewhere in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onstoragechanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onstoragechanged attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onstoragechanged attribute is authored on the chip strip.
    expect(track!.hasAttribute("onstoragechanged")).toBe(false);
    expect(track!.getAttribute("onstoragechanged")).toBeNull();
  });
});
