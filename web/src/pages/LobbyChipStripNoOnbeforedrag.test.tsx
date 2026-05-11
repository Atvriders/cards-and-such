import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforedrag` attribute.
 *
 * `onbeforedrag` is a non-standard / legacy event-handler attribute
 * (historically IE/Trident-flavored drag lifecycle hook). On a
 * `<div role="tablist">` it is meaningless: the standard drag
 * lifecycle uses `ondragstart` / `ondragend` and the chip strip is
 * not a draggable element. Authoring `onbeforedrag` on the filter
 * rail would:
 *   1. Pollute validator output (unknown attribute on a generic
 *      div tablist).
 *   2. Imply a drag-initiation hook that does not exist in
 *      standards-compliant user agents.
 *   3. Slip past every existing legacy-attribute pin in the
 *      LobbyChipStripNo* family, none of which currently cover
 *      `onbeforedrag`.
 *
 * The pin asserts BOTH `hasAttribute("onbeforedrag") === false` and
 * `getAttribute("onbeforedrag") === null` — covering the canonical
 * absence primitive and the value-side null check.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforedrag attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforedrag attribute", () => {
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

    // The pin: NO onbeforedrag attribute is authored on the chip strip.
    expect(track!.hasAttribute("onbeforedrag")).toBe(false);
    expect(track!.getAttribute("onbeforedrag")).toBeNull();
  });
});
