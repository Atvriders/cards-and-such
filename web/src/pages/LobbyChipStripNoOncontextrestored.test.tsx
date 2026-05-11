import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oncontextrestored` attribute.
 *
 * `oncontextrestored` is a legacy/proposed IDL event-handler attribute
 * historically tied to the canvas context-restoration event. On a
 * `<div role="tablist">` filter rail it is meaningless: the chip strip
 * is a flex/scroll container of `role="tab"` buttons — it owns no
 * rendering context that could be lost or restored, and authoring an
 * inline `oncontextrestored="..."` handler on it would be a stray
 * event-handler binding that:
 *  1. Cannot fire on a non-canvas element.
 *  2. Pollutes the DOM with an unparsed inline-handler string.
 *  3. Slips past every existing LobbyChipStripNo* pin, since none of
 *     them currently cover `oncontextrestored`.
 *
 * The pin: `track.hasAttribute("oncontextrestored") === false` AND
 * `track.getAttribute("oncontextrestored") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no oncontextrestored attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oncontextrestored attribute", () => {
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

    // The pin: NO oncontextrestored attribute is authored on the chip strip.
    expect(track!.hasAttribute("oncontextrestored")).toBe(false);
    expect(track!.getAttribute("oncontextrestored")).toBeNull();
  });
});
